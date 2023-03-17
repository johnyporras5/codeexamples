from django.conf import settings
from django.core.mail import EmailMultiAlternatives, EmailMessage
from django.template.loader import render_to_string
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

from api.models import UserTradier, UserProfile
from backend.loggers import command_logger

from utils.tradier import  BASE_URL, ACCESS_TOKEN
from utils.tdameritrade import  BASE_URL as TD_BASE_URL

logger = command_logger
def get_tdameritrade_account(user):
    td = user.tdmeritrades.first()
    if not td:
        td = user.tdmeritrades.create(
            url=TD_BASE_URL,
            account_id=settings.TDAMERITRADE_ACCOUNT_ID,
            customer_key=settings.TDAMERITRADE_CUSTOMER_KEY

        )
    return td

def get_tradier_account(user=None, **kw):
    qs = UserTradier.objects
    if user:
        qs = qs.filter(user=user)
    instance = qs.first()
    if not instance:
        instance = UserTradier.objects.create(
            url=BASE_URL,
            token=ACCESS_TOKEN

        )
    return instance


def send_user_sms(user, msg):
    user_profile = UserProfile.objects.filter(user=user).first()

    if not (user_profile and user_profile.phone):
        logger.info(f'send_user_sms look like user:{user.pk} has no phone!')
        return

    phone = user_profile.phone



    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    client = Client(account_sid, auth_token)
    try:
        logger.info(f'send_user_sms sent to:{phone} msg:{msg}')
        message = client.messages.create(
            messaging_service_sid=settings.TWILIO_SERVICE_SID,
            to=phone,
            body=msg)
        logger.info(f'send_user_sms sent to:{phone} message:{message}')
    except TwilioRestException as err:
        # Implement your fallback code here
        logger.info(f'send_user_sms error:{err}')

def send_user_email(title, payload, txt_tpl, html_tpl=None):
    # render email text

    email = payload.get('email', None)
    email_plaintext_message = render_to_string(txt_tpl, payload)
    if html_tpl:
        email_html_message = render_to_string(html_tpl, payload)
        msg = EmailMultiAlternatives(
            # title:
            title,
            # message:
            email_plaintext_message,
            # from:
            settings.DEFAULT_FROM_EMAIL,
            # to:
            [email]
        )
        msg.attach_alternative(email_html_message, "text/html")
    else:
        msg = EmailMessage(
            title, email_plaintext_message,
            to=[email]
        )
    msg.send()

def send_user_notification(user, msg):
    logger.info(f'send_user_notification user:{user.pk} msg:{msg}')

    send_user_sms(user, msg)

    payload = {
        'email': user.email,
        'user': user,
        'msg': msg,
    }
    send_user_email("Collection data issue!", payload,
        'api/email/user_collect_data_failed.txt',)

    logger.info(f'send_user_notification user:{user.pk} msg:{msg} done.')