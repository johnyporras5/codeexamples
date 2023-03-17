import os
from schemas.match import MatchSchema
from schemas.match_detail import MatchDetailSchema
from libs.strings import gettext
from logfile import logger
from datetime import date, datetime
import json
from distutils.util import strtobool
import traceback
import shortuuid
from flask import request
from db import db
from models.match_detail import MatchDetailModel
from models.movement import MovementModel
from models.user import UserModel
from libs.path import (
                       get_image_path_game,
                       get_image_path_user,
                       get_image_path_match
                       )

from models.match import MatchModel
from models.wallet import WalletModel
from flask_jwt_extended import (
                                get_jwt_identity,
                                jwt_required
                                )
from schemas.image import MatchResultSchema
from flask_restful import Resource
from libs import image_helper

match_schema = MatchSchema()
match_detail_schema = MatchDetailSchema(many=True)
image_schema = MatchResultSchema()
MATCH_COMPANY_FEE = 10


class Match(Resource):
    @jwt_required
    def post(cls):
        user_id = get_jwt_identity()
        if user_id is None:
            return {"message": gettext("user_not_found")}, 404
        match_json = request.get_json()
        object_wallet = WalletModel.find_by_user(user_id)
        if object_wallet.balance < match_json["amount_challenge"]:
            return {"message": gettext("not_enough_balance")}, 401
        try:
            match_object = match_schema.load(match_json)
            match_object.datetime_created = datetime.today()
            match_object.game_id = match_json["game_id"]
            match_object.amount_challenge = match_json["amount_challenge"]
            match_object.amount_bag = 0
            match_object.status_id = 1
            shortuuid.set_alphabet("1234567890")
            match_object.uuid = shortuuid.ShortUUID().random(length=6)
            if match_json["challenge_type"] == "2":
                if match_json["contender_id"] is None:
                    return {"message": gettext("contender_id_needed")}, 400
                if match_json["contender_id"] == user_id:
                    return {"message": gettext("wrong_contender_id")}, 400
                match_object.contender_id = match_json["contender_id"]
            db.session.add(match_object)
            match_detail = MatchDetailModel(match=match_object)
            match_detail.player_team = user_id
            match_detail.player_type = 'CH'
            match_detail.is_winner = 0
            db.session.add(match_detail)
            db.session.flush()
            db.session.commit()
            match_object.uuid = f"{match_object.uuid}-{match_object.id}"
            db.session.add(match_detail)
            db.session.commit()
            match_object.send_matchcreated_email()
            return {"message": gettext("match_created")}, 200
        except:
            traceback.print_exc()
            return {"message": gettext("match_error_creating")}, 400

    @jwt_required
    def get(self):
        user_id = get_jwt_identity()
        match_json = request.args
        direct_match = True if strtobool(match_json["direct_match"]) == 1 else False
        rows = MatchModel.find_matches_created(user_id, direct_match)
        matches = []
        for row in rows:
            row_dict = {
                "amount_challenge": row.amount_challenge,
                "match_id": row.match_id,
                "challenger_id": row.challenger_id,
                "name": row.name + "("+row.username+")",
                "user_image_path": get_image_path_user(user_id) + row.avatar_file if row.avatar_file else None,
                "game_name": row.game_name,
                "game_image_path": get_image_path_game(row.game_id) + row.game_image_path if row.game_image_path else None,
                "game_id": row.game_id
            }
            matches.append(row_dict)
        print(matches)
        return {"matches":matches}, 200

    @jwt_required
    def put(self):
        user_id = get_jwt_identity()
        print(user_id)
        if user_id is None:
            return {"message": gettext("user_not_found")}, 401
        data_json = request.get_json()
        if data_json["match_id"] is None:
            return {"message": gettext("no_match_id_given")}, 401
        obj_match = db.session.query(MatchModel).filter(MatchModel.id == data_json["match_id"]).with_for_update().one()
        if data_json["response"] == "reject":
            obj_match.status_id = 9
            db.session.add(obj_match)
            db.session.commit()
            return {"message": gettext("match_rejected")}, 200
        if obj_match.status_id == 2:
            return {"message": gettext("match_accepted_yet")}, 401
        user_wallet = UserModel.find_by_id(user_id).wallet.first()
        if obj_match:
            user_balance_after = user_wallet.balance - obj_match.amount_challenge
            if user_balance_after < 0:
                return {"message": gettext("not_enough_balance")}, 401
            obj_match.status_id = 2
            amount_company = (obj_match.amount_challenge * MATCH_COMPANY_FEE) / 100
            amount_player_to_bag = obj_match.amount_challenge - amount_company
            obj_match.amount_bag = obj_match.amount_bag + amount_player_to_bag
            movement = MovementModel()
            movement.movement_type_id = 2
            movement.date = date.today()
            movement.amount =  obj_match.amount_challenge*(-1)
            movement.wallet_id = user_wallet.id
            movement.payment_method_id = 2
            object_wallet = WalletModel.find_by_id(movement.wallet_id)
            movement.balance = float(object_wallet.get_last_balance()) + float(movement.amount)
            movement.status = 1
            object_wallet.balance = movement.balance
            db.session.add(object_wallet)
            db.session.add(movement)
            match_detail = MatchDetailModel(match=obj_match, wallet_movement=movement)
            match_detail.player_team = user_id
            match_detail.player_type = 'CO'
            match_detail.is_winner = 0
            match_detail.match_id = obj_match.id
            db.session.add(match_detail)
            match_detail_challenger = MatchDetailModel.find_by_user(data_json["challenger_id"], obj_match.id)

            if match_detail_challenger.movement_id is None:
                movement_challenger = MovementModel()
                movement_challenger.movement_type_id = 2
                movement_challenger.date = date.today()
                movement_challenger.amount = obj_match.amount_challenge * (-1)
                movement_challenger.wallet_id = UserModel.find_by_id(data_json["challenger_id"]).wallet.first().id
                movement_challenger.payment_method_id = 2
                object_wallet = WalletModel.find_by_id(movement_challenger.wallet_id)
                print(object_wallet)
                movement_challenger.balance = float(object_wallet.get_last_balance()) + float(movement_challenger.amount)
                object_wallet.balance = movement_challenger.balance
                match_detail_challenger.wallet_movement = movement_challenger
                db.session.add(object_wallet)
                db.session.add(movement_challenger)
                db.session.add(match_detail_challenger)
                obj_match.amount_bag += amount_player_to_bag
                amount_company += amount_company
            db.session.add(obj_match)
            movement_app = MovementModel()
            movement_app.date = date.today()
            movement_app.movement_type_id = 6
            movement_app.amount = amount_company
            movement_app.wallet_id = 3
            movement_app.payment_method_id = 2
            object_wallet = WalletModel.find_by_id(movement_app.wallet_id)
            movement_app.balance = float(object_wallet.get_last_balance()) + float(movement_app.amount)
            movement_app.status = 1
            object_wallet.balance = movement_app.balance
            db.session.add(object_wallet)
            db.session.add(movement_app)
            db.session.flush()
            db.session.commit()
            obj_match.send_matchaccepted_email()

            resp = {}
            resp["match_id"] = obj_match.id
            resp["status_id"] = 2 if obj_match.status_id == 2 or obj_match.status_id == 3 else obj_match.status_id
            resp["game_id"] = obj_match.game_id
            resp["game_name"] = obj_match.game.name
            resp["game_image_path"] = get_image_path_game(
                obj_match.game.id) + obj_match.game.image_path if obj_match.game.image_path else None
            resp["amount_challenge"] = obj_match.amount_bag
            resp["date_created"] = obj_match.datetime_created.strftime('%m/%d/%Y')
            resp["players"] = []
            for detail in obj_match.details.all():
                obj_detail = {
                    "id_user": detail.user.id,
                    "name": detail.user.name,
                    "avatar_file": get_image_path_user(
                        detail.user.id) + detail.user.avatar_file if detail.user.avatar_file else None
                }
                resp["players"].append(obj_detail)
            return {"message": gettext("match_accepted_successfully"),"data": resp}, 200


    @jwt_required
    def patch(self):
        user_id = get_jwt_identity()
        if user_id is None:
            return {"message": gettext("user_not_found")}, 401
        data_match = request.form
        if data_match["match_id"] is None:
            return {"message": gettext("no_match_id_given")}, 401
        if data_match["score"] is None:
            return {"message": gettext("score_is_needed")}, 401
        obj_match = db.session.query(MatchModel).filter(MatchModel.id == data_match["match_id"]).with_for_update().one()
        if obj_match is None:
            return {"message": gettext("match_not_found")}, 401
        if len(request.files) == 0:
            return {"message": gettext("screenshot_is_needed")}, 401
        print(request.files)
        image_data = image_schema.load(request.files)

        if obj_match.status_id == 2:
            obj_match.status_id = 3
            db.session.add(obj_match)
            obj_detail = obj_match.details.filter_by(player_team=user_id).first()
            obj_detail.score = data_match["score"]
            image = image_helper.get_basename(image_data["screenshot"].filename)
            folder = f"match/{obj_match.id}/result/{user_id}"
            image_helper.save_image_do(
                image_data["screenshot"], folder=folder, name=image
            )
            obj_detail.image_score = image
            db.session.add(obj_detail)
            db.session.commit()
            return {"message": gettext("result_stored_correctly"),"tied": False ,"first_score": True}, 200
        elif obj_match.status_id == 3:
            obj_detail = obj_match.details.filter(MatchDetailModel.player_team != user_id).first()
            obj_detail_current_user = obj_match.details.filter(MatchDetailModel.player_team == user_id).first()
            if obj_detail_current_user.score is not None:
                return {"message": gettext("score_registered_yet")}, 401
            obj_detail_current_user.score = data_match["score"]
            image = image_helper.get_basename(image_data["screenshot"].filename)
            folder = f"match/{obj_match.id}/result/{user_id}"
            image_helper.save_image_do(
                image_data["screenshot"], folder=folder, name=image
            )
            obj_detail.image_score = image
            if not self.compare_score(json.loads(obj_detail.score), json.loads(data_match["score"])):
                if obj_match.wrong_score == 1:
                    obj_match.status_id = 5
                    db.session.add(obj_match)
                    db.session.add(obj_detail_current_user)
                    db.session.commit()
                    obj_match.send_matchclaim_email()
                    return {"message": gettext("match_pass_claim"),"tied": False,"first_score": False, "finished": True, "claim": True}, 200
                obj_detail.score = None
                db.session.add(obj_detail)
                obj_match.status_id = 2
                obj_match.wrong_score = 1
                db.session.add(obj_match)
                db.session.commit()
                obj_match.send_match_wongscore_email()
                return {"message": gettext("wrong_score"),"tied": False,"first_score": False,"wrong_score": True}, 200
            obj_detail = obj_match.details.filter_by(player_team=user_id).first()
            obj_detail.score = data_match["score"]
            db.session.add(obj_detail)
            winner = self.get_winner(json.loads(obj_detail.score))
            if winner > -1:
                obj_detail_winner = obj_match.details.filter_by(player_team=json.loads(data_match["score"])[int(winner)]["user_id"]).first()
                obj_detail_winner.is_winner = 1
                obj_match.status_id = 6
                movement = MovementModel()
                movement.movement_type_id = 3
                movement.date = date.today()
                movement.amount = obj_match.amount_bag
                movement.wallet_id = UserModel.find_by_id(json.loads(data_match["score"])[int(winner)]["user_id"]).wallet.first().id
                movement.payment_method_id = 2
                object_wallet = WalletModel.find_by_id(movement.wallet_id)
                movement.balance = float(object_wallet.get_last_balance()) + float(movement.amount)
                movement.status = 1
                object_wallet.balance = movement.balance
                db.session.add(object_wallet)
                db.session.add(movement)
                db.session.add(obj_detail_winner)
                db.session.commit()
                obj_match.send_matchwinner_email()
                return {"message": gettext("match_closed_correctly"),"tied": False,"first_score": False, "finished": True}, 200
            obj_match.status_id = 8
            db.session.commit()
            obj_match.send_matchtied_email()
            return {"message": gettext("match_tied"),"tied": True,"first_score": False}, 200

    @classmethod
    def compare_score(self, scores1, scores2):
        for score1 in scores1:
            print(score1)
            for score2 in scores2:
                if score1["user_id"] == score2["user_id"] and score1["score"] != score2["score"]:
                    return False
        return True

    @classmethod
    def get_winner(self, scores):
        score_winner = -1
        i = -1
        tied = False
        for score in scores:
            if score["score"] > score_winner:
                i += 1
                score_winner = score["score"]
                if i > 0:
                    tied = False
            elif score["score"] == score_winner:
                tied = True
        return -1 if tied else i


class MatchList(Resource):
    @jwt_required
    def get(self):
        user_id = get_jwt_identity()
        data_json = request.args
        ret = []
        matches = MatchModel.find_by_user(data_json["status_id"] , user_id)
        print(matches)
        for row in matches:
            resp = {}
            resp["match_id"] = row.id
            resp["status_id"] = 2 if row.status_id == 2 or row.status_id == 3 else row.status_id
            resp["game_id"] = row.game_id
            resp["game_name"] = row.game.name
            resp["game_image_path"] = get_image_path_game(row.game.id) + row.game.image_path if row.game.image_path else None
            resp["amount_challenge"] = row.amount_bag
            resp["date_created"] = row.datetime_created.strftime('%m/%d/%Y')
            resp["players"] = []
            waiting_other_score = None
            for detail in row.details.all():
                obj_detail = {
                    "id_user": detail.user.id,
                    "name": detail.user.name,
                    "avatar_file": get_image_path_user(detail.user.id) + detail.user.avatar_file if detail.user.avatar_file else None
                }
                # if row.status_id == 3:
                #   if detail.player_team == user_id and detail.score is not None:
                #        waiting_other_score = True
                #    if detail.player_team == user_id and detail.score is None:
                #        waiting_other_score = False
                resp["players"].append(obj_detail)
           # if row.status_id == 3:
           #     resp["waiting_other_score"] = waiting_other_score
            ret.append(resp)
            del resp
        return {"matches": ret}, 200


class MatchResume(Resource):
    @jwt_required
    def get(self):
        user_id = get_jwt_identity()
        total = 0
        wins = 0
        lose = 0
        for row in MatchModel.find_details_by_user(user_id):
            total += 1
            if row.is_winner == 1:
                wins += 1
            if row.is_winner == 0 and row.status_id == 6:
                lose += 1
        return {"total_wins": wins, "total_lost": lose, "total_matches": total}, 200


class MatchHistory(Resource):
    @jwt_required
    def get(self):
        user_id = get_jwt_identity()
        data_json = request.args
        ret = []
        print(data_json)
        matches = MatchModel.find_by_dinamic_filter(data_json, user_id)
        print(matches)
        for row in matches:
            resp = {}
            resp["match_id"] = row.id
            resp["game_id"] = row.game_id
            resp["status"] = row.status.name
            resp["game_name"] = row.game.name
            resp["game_image_path"] = get_image_path_game(row.game.id) + row.game.image_path
            resp["amount_bag"] = row.amount_challenge
            resp["date"] = row.datetime_created.strftime('%d/%m/%Y')
            for detail in row.details.all():
                if detail.player_team != user_id:
                    resp["rival"] = detail.user.name + f"({detail.user.username})"
                if row.status_id in [6, 7]:
                    resp["winner"] = True if detail.is_winner == 1 and detail.player_team == user_id else False
            ret.append(resp)
            del resp
        return {"matches": ret}, 200


class MatchHistoryGeneral(Resource):
    def get(self):
        data_json = request.args
        ret = []
        matches = MatchModel.find_by_dinamic_filter(data_json, None)
        print(matches)
        for row in matches:
            resp = {}
            resp["match_id"] = row.id
            resp["match_code"] = row.uuid
            resp["amount_bag"] = row.amount_bag
            resp["status_id"] = row.status_id
            resp["game_id"] = row.game_id
            resp["game_name"] = row.game.name
            resp["amount_challenge"] = row.amount_challenge
            resp["date"] = row.datetime_created.strftime('%m/%d/%Y')
            resp["players"] = []
            for detail in row.details.all():
                local_score_image = ""
                if detail.image_score is not None:
                    local_score_image = get_image_path_match(row.id, detail.player_team) + detail.image_score
                score_dict = []
                if detail.score is not None:
                    score_object = json.loads(detail.score)
                    for score_detail in score_object:
                        user_object = UserModel.find_by_id(score_detail.get("user_id"))
                        score_response = {
                            "user_name": user_object.name,
                            "score_value": score_detail.get("score")
                        }
                        score_dict.append(score_response)
                obj_detail = {
                    "id_user": detail.user.id,
                    "name": detail.user.name,
                    "score": score_dict,
                    "score_image_path": local_score_image
                }
                resp["players"].append(obj_detail)
            ret.append(resp)
            del resp
        return {"matches": ret}, 200








