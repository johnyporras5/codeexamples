from django.db import models
from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Sum
from datetime import timedelta
from django.db.models import Q

class BaseDateTimeModel(models.Model):
    class Meta:
        abstract = True

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Symbol(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, unique=True)
    buy_threshold = models.FloatField(blank=False)
    sell_threshold = models.FloatField(blank=False)
    loss_threshold = models.FloatField(blank=True)
    max_open_orders = models.FloatField(blank=False)
    amount = models.FloatField(blank=False)
    previous_b = models.FloatField(blank = True, null=True)

    def __str__(self):
        return self.name

    @property
    def buys(self):
        sum = Transaction.objects.filter(type = 'BUY').filter(status="FILLED").filter(symbol=self).count()
        return sum

    @property
    def open_orders(self):
        transactions = Transaction.objects.filter(symbol = self).filter(~Q(status='FILLED'))
        return transactions.count()

    @property
    def sells(self):
        sum = Transaction.objects.filter(type='SELL').filter(status="FILLED").filter(symbol=self).count()
        return sum

    @property
    def date_purchased(self):
       latest = Transaction.objects.filter(symbol=self).filter(status="FILLED").order_by('-transaction_date').first()
       if latest:
          return (latest.transaction_date-timedelta(hours=4)).strftime("%m-%d-%Y")
       return 'N/A'

    @property
    def total_profit(self):
        transactions = Transaction.objects.filter(type='BUY').filter(status="FILLED").filter(sold=True).filter(symbol=self)
        profits = 0
        for transaction in transactions:
            if transaction.profit != 'N/A':
                profits += transaction.profit
        return round(profits, 2)


class PriceT(models.Model):
    symbol = models.ForeignKey(Symbol, on_delete=models.CASCADE)
    price = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.symbol.name

class Price(models.Model):
    symbol = models.ForeignKey(Symbol, on_delete=models.CASCADE)
    price = models.FloatField(blank=True, null=True)
    low = models.FloatField(blank=True, null=True, default=0)
    high = models.FloatField(blank=True, null=True, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    timestamp = models.BigIntegerField(blank=True, null=True,
                                       db_index=True)

    def __str__(self):
        return self.symbol.name


    def low_high_price(self, pivotInterval):
        time_span = pivotInterval * 1000
        low_price = self.price
        high_price = self.price
        prices = Price.objects.filter(timestamp__gte=self.timestamp - time_span).filter(timestamp__lte = self.timestamp).filter(timestamp__lte = self.timestamp).filter(symbol=self.symbol)
        for price in prices:
            if low_price > price.price:
                low_price = price.price
            if high_price < price.price:
                high_price = price.price
        return low_price, high_price



class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.ForeignKey(Symbol, on_delete=models.CASCADE)
    type = models.CharField(max_length=100)
    order_id = models.CharField(max_length=100)
    amount = models.FloatField(blank=True, null=True)
    price = models.FloatField(blank=True, null=True)
    cost = models.FloatField(blank=True, null=True)
    sold = models.BooleanField(default=False, blank=False)
    status = models.CharField(max_length=100, blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    related_id = models.IntegerField(blank=True, null=True)

    @property
    def transaction_datetime_date(self):
        if self.transaction_date:
            return (self.transaction_date-timedelta(hours=4)).strftime("%m-%d-%Y")
        return None

    @property
    def transaction_datetime_time(self):
        if self.transaction_date:
            return (self.transaction_date-timedelta(hours=4)).strftime("%I:%M %p")
        return None

    @property
    def transaction_datetime_time2(self):
        if self.transaction_date:
            seconds = 10
            second = int(int(self.transaction_date.strftime("%S")) / seconds) * seconds
            return (self.transaction_date - timedelta(hours=4)).strftime(f"%I:%M:{str(second).zfill(2)} %p")
        return None

    @property
    def sell_transaction(self):
        transaction =  Transaction.objects.filter(related_id= self.pk).first()
        if transaction:
            return { 'id': transaction.id, 'price' : transaction.price if transaction.price else 'N/A' , 'order_id' : transaction.order_id}
        return None

    @property
    def profit(self):
        if self.type == 'BUY':
           transaction = Transaction.objects.filter(related_id = self.pk).first()
           if transaction and transaction.status == "FILLED":
               profit = transaction.cost+ self.cost
               return round(profit, 2)
        return 'N/A'

    @property
    def time_open(self):
        if self.type == 'BUY':
            transaction = Transaction.objects.filter(related_id=self.pk).first()
            if transaction and transaction.transaction_date and self.transaction_date:
               offset = int((transaction.transaction_date-self.transaction_date).total_seconds() / 60)
               return offset
        return 'N/A'

    @property
    def symbol_name(self):
        return self.symbol.name


class AuthToken(BaseDateTimeModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=2000)
    t_access_token = models.CharField(max_length=2000,null=True, blank=True)
    refresh_token = models.CharField(max_length=2000)
    t_refresh_token = models.CharField(max_length=2000, null=True, blank=True)
    enable = models.BooleanField(default=False)

    def refresh_access_token(self):
        from utils.tdameritrade import Tdameritrade
        tdameritrade = Tdameritrade()
        access_token, refresh_token = tdameritrade.get_token(None, self.refresh_token)
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.save()

    def __str__(self):
        return str(self.user)

class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=100, blank=True, null=True)
    enable = models.BooleanField(default=False)

class SymbolSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Symbol
        fields = ('name', 'sell_threshold', 'buy_threshold','loss_threshold', 'amount', 'pk', 'buys', 'sells', 'date_purchased','open_orders', 'max_open_orders','total_profit')


class TransactionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Transaction
        fields = ('symbol_name', 'type', 'order_id','transaction_datetime_date', 'transaction_datetime_time','sell_transaction','price', 'amount', 'cost','profit',  'time_open')



class UserTdameritrade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='tdmeritrades')
    url = models.CharField(max_length=255, blank=True, null=True)
    account_id = models.CharField(max_length=100)
    customer_key = models.CharField(max_length=100)
    enable = models.BooleanField(default=True)


class UserTradier(models.Model):
    user = models.ForeignKey(User,
                             on_delete=models.SET_NULL,
                             related_name='tradiers',
                             blank=True,
                             null=True)
    url = models.CharField(max_length=255)
    token = models.CharField(max_length=100)
    enable = models.BooleanField(default=True)

    def __str__(self):
        return self.token

