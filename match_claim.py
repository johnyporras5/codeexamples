from flask_restful import Resource
from flask import request
from flask_jwt_extended import (
    jwt_required

)
from models.wallet import WalletModel
from models.user import UserModel
from datetime import date
from db import db
import traceback
from models.match import MatchModel
from models.movement import MovementModel
from libs.strings import gettext
from enums.match_status import MatchStatusEnum


class MatchClaim(Resource):
    @classmethod
    @jwt_required
    def post(cls):
        data_match = request.get_json()
        if data_match["match_id"] is None:
            return {"message": gettext("no_match_id_given")}, 401
        if data_match.get("user_winner") == 0:
            print(data_match["match_id"])
            if cls.RevertMatch(data_match["match_id"]):
                return {"message": gettext("match_closed_correctly")}, 200
            return {"message": gettext("match_closed_failed")}, 400
        try:
            obj_match = db.session.query(MatchModel).filter(MatchModel.id == data_match["match_id"]).with_for_update().one()
        except:
            return {"message": gettext("match_not_found")}, 401
        if obj_match.status_id != MatchStatusEnum.CLAIM.value:
            return {"message": gettext("match_not_in_claimed")}, 401

        obj_detail_winner = obj_match.details.filter_by(
            player_team=data_match.get("user_winner")).first()
        obj_detail_winner.is_winner = 1
        obj_match.status_id = 6
        movement = MovementModel()
        movement.status = 1
        movement.movement_type_id = 3
        movement.date = date.today()
        movement.amount = obj_match.amount_bag
        movement.wallet_id = UserModel.find_by_id(data_match.get("user_winner")).wallet.first().id
        movement.payment_method_id = 2
        object_wallet = WalletModel.find_by_id(movement.wallet_id)
        movement.balance = float(object_wallet.get_last_balance()) + float(movement.amount)
        object_wallet.balance = movement.balance
        db.session.add(object_wallet)
        db.session.add(movement)
        db.session.add(obj_detail_winner)
        db.session.commit()
        obj_match.send_matchwinner_email()
        return {"message": gettext("match_closed_correctly")}, 200

    @classmethod
    def RevertMatch(self, match_id):
        if  match_id is not None:
            try:
                obj_match = db.session.query(MatchModel).filter(MatchModel.id == match_id).with_for_update().one()
                amount = obj_match.amount_bag
                details = obj_match.details
                amount_refund = amount / details.count()
                for detail in details:
                    movement = MovementModel()
                    movement.status = 1
                    movement.movement_type_id = 5
                    movement.date = date.today()
                    movement.amount = amount_refund
                    movement.wallet_id = detail.user.wallet.first().id
                    movement.payment_method_id = 2
                    object_wallet = WalletModel.find_by_id(detail.user.wallet.first().id)
                    movement.balance = float(object_wallet.get_last_balance()) + float(movement.amount)
                    object_wallet.balance = movement.balance
                    db.session.add(movement)
                obj_match.status_id = 7
                db.session.add(obj_match)
                db.session.commit()
                obj_match.send_matchreverse_email()
                return True
            except:
                traceback.print_exc()
                return False
        return False





