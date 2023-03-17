from db import db
from typing import List


class MovementTypeModel(db.Model):
    __tablename__ = 'movement_type'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(2))
    name = db.Column(db.String(45))

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_all(cls) -> List["MovementTypeModel"]:
        return cls.query.filter(MovementTypeModel.id < 6).all()
