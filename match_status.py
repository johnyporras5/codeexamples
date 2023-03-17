from flask_restful import Resource
from models.match_status import MatchStatusModel
from flask_jwt_extended import jwt_required


class MatchStatusList(Resource):
    @classmethod
    @jwt_required
    def get(cls):
        response = []
        status_list = MatchStatusModel.find_all()
        for status in status_list:
            dict_status = {
                "id": status.id,
                "name": status.description
            }
            response.append(dict_status)
        return {"games": response}, 200
