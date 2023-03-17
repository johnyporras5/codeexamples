from flask_restful import Resource
from flask import request
from flask_jwt_extended import (
    jwt_required

)
from db import db
from models.match import MatchModel
from models.movement import MovementModel
from libs.strings import gettext

MATCH_COMPANY_FEE = 20


class ReMatch(Resource):
    @classmethod
    @jwt_required
    def post(cls):
        data_match = request.get_json()
        if data_match["match_id"] is None:
            return {"message": gettext("no_match_id_given")}, 500
        try:
            obj_match = db.session.query(MatchModel).filter(MatchModel.id == data_match["match_id"]).with_for_update().one()
        except:
            return {"message": gettext("match_not_found")}, 500
        if obj_match is None:
            return {"message": gettext("match_not_found")}, 500
        if obj_match.status_id != 8:
            return {"message": gettext("match_not_tied")}, 500
        match_company_fee = ((obj_match.amount_bag * MATCH_COMPANY_FEE)/100) * len(obj_match.details.all())
        obj_match.amount_bag -= match_company_fee
        obj_match.status_id = 2
        db.session.add(obj_match)
        movement_app = MovementModel()
        movement_app.movement_type_id = 6
        movement_app.amount = match_company_fee
        movement_app.wallet_id = 3
        movement_app.payment_method_id = 2
        db.session.add(movement_app)
        db.session.flush()
        db.session.commit()
        obj_match.send_matchaccepted_email()
        return {"message": gettext("rematch_success")}, 200

