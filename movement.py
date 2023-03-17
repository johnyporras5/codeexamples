from db import db
from requests import Response
from libs import strings
from libs.mailgun import Mailgun
from libs.strings import gettext
from models.movement_type import MovementTypeModel
from models.payment_method import PaymentMethodModel
from sqlalchemy import funcfilter
from sqlalchemy.sql import func
from typing import List


class MovementModel(db.Model):
    __tablename__ = 'wallet_movement'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    status = db.Column(db.Integer)
    amount = db.Column(db.DECIMAL(12, 2))
    balance = db.Column(db.DECIMAL(12, 2))
    transaction_id = db.Column(db.String(200))
    wallet_id = db.Column(db.ForeignKey('wallet.id'), nullable=False, index=True)
    payment_method_id = db.Column(db.ForeignKey('payment_method.id'), nullable=False, index=True)
    movement_type_id = db.Column(db.ForeignKey('movement_type.id'), nullable=False, index=True)
    movement_type = db.relationship('MovementTypeModel')
    payment_method = db.relationship('PaymentMethodModel')
    wallet = db.relationship('WalletModel')

    def save_to_db(self) -> None:
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_transaction(cls , _id: int) -> "MovementModel":
        return cls.query.filter_by(transaction_id=_id).first()

    @classmethod
    def find_total_by_wallet(cls , _id: int):
        raw_sql = "select sum(amount) as total " \
                  "from wallet_movement " \
                  "where status = :val and wallet_id=:val2"
        return db.session.execute(raw_sql, {'val': 1, 'val2': _id}).first()

    def send_confirmation_email(self) -> Response:
        print(self.wallet.id)
        print(self.wallet.user.email)
        print(self.payment_method.name)
        subject = "Matchups MatchPoint"
        template = gettext("template_mail_matchpoint_buying")
        print(template)
        variables = {"name": self.wallet.user.name,"amount": str(self.amount),"transaction_id": self.transaction_id,"date": str(self.date),"payment_method": self.payment_method.name}
        return Mailgun.send_email_template([self.wallet.user.email], subject, template=template, variables=variables)

    def send_confirmation_email_payout(self) -> Response:
        print(self.wallet.id)
        print(self.wallet.user.email)
        print(self.payment_method.name)
        subject = gettext("template_mail_matchpoint_payout_subject")
        template = gettext("template_mail_matchpoint_payout")
        print(template)
        variables = {
                     "name": self.wallet.user.name,
                     "amount": str(abs(self.amount)),
                     "transaction_id": self.transaction_id,
                     "date": str(self.date),
                     "payment_method": self.payment_method.name
                    }

        return Mailgun.send_email_template([self.wallet.user.email], subject, template=template, variables=variables)




