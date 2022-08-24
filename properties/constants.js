/**
 * Created by Rishikesh Arya on 16/11/19.
 */

exports.responseMessages = {
  "PARAMETER_MISSING"         : "Parameter missing",
  "INVALID_ACCESS_TOKEN"      : "Invalid access token",
  "WRONG_PASSWORD"            : "Invalid password",
  "ACTION_COMPLETE"           : "Successfull",
  "SHOW_ERROR_MESSAGE"        : "Something went wrong",
  "ERROR_IN_EXECUTION"        : "Error in execution",
  "INVALID_ACCESS"            : "Invalid email or password",
  "EMAIL_NOT_EXISTS"          : "Email doesn't exists",
  "USER_NOT_FOUND"            : "user doesn't exists",
  "EMAIl_ALREADY_EXIST"       : "Email already exists",
  "PHONE_NUMBER_ALREADY_EXIST": "phone already exists",
  "INVALID_ACTION"            : "Invalid Action",
  "FORCE_UPDATE"              : "We have added a lot of new features for you.\n\nPlease, update it to the latest version.",
  "SOFT_UPDATE"               : "We have added a lot of new features for you.\n\nDo you want to make them available for your use?",
  "INVALID_OTP"               : "Invalid OTP",
  "UNABLE_TO_UPLOAD"          : "Something is wrong! Unable to upload at the moment.",
  "INVALID_API_KEY"           : "You are not authorised to perform this action"
};

//FOR FLAGS
exports.responseFlags = {
  PARAMETER_MISSING        : 201,
  ACTION_COMPLETE          : 200,
  SHOW_ERROR_MESSAGE       : 400,
  UPDATE_YOUR_APP          : 201
};

exports.DEVICE_TYPE = {
  "1"      : "IOS",
  "2"      : "ANDROID",
  "IOS"    : "1",
  "ANDROID": "2"
}

exports.EMAIL_TEMPLATES = {
  FORGET_PASSWORD: `<!DOCTYPE html>
                    <html>
                    <body>
                    <h2>
                      Your verification code is: {{OTP}}
                    </h2> 
                    <h5>
                      if you are having issues with your account, please don't hesitate to contact us by replying to this email.
                      <br>
                      Thanks!
                      <br>
                      Team FOTD
                    </h5>
                    </body>
                    </html>`
}

exports.EMAIL_SUBJECT_LINE = {
  FORGET_PASSWORD : "Forgot password"
}

exports.LIKE_STATUS = {
  LIKED   : 1,
  DISLIKED: 0,
  NONE    : 2
}

exports.FACT_TYPE = {
  DAILY_FACT  : 1,
  ADMIN_FACT  : 2,
  USER_FACT   : 3
}

exports.gateway = config.get("IOSPushGateway");
exports.pathToPem = "/root/node-app/pem/FOTD.pem";
exports.FCM_KEY = "AAAAECEfq1A:APA91bG2TqwxhC2cXfwZF-jkJwh-IAbqR0A_EUJrde8hao1d1MpWta22oM1u84yYSDvJovKmjBn1YHN8ydn4cpw0Jkh9sRpi8nlybrKzsSf8zdDo42BzPkxXYokWZAjWf92HMoqPEG_b";

exports.FOTP_DISPLAY_NAME = "official@factoftheday.in";
exports.FOTP_DISPLAY_ICON = encodeURIComponent("https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/Documents%2Ffotd_placeholder.png?alt=media&token=cb60987d-cb02-4c0a-ad93-7216f06c8f54");
exports.DEFAULT_USER_IMAGE = encodeURIComponent("https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/Documents%2Fprofile_placeholder.png?alt=media&token=3be2458b-8f08-4b76-808c-5ea8d10b8e2b");

exports.CLOUD_CREDS = {
  PROJECT_ID           : "fotd-60e29",
  PRIVATE_KEY_PATH     : "private_key.json",
  BUCKET_NAME          : "fotd-60e29.appspot.com",
  CLOUD_FILE_PATH      : "https://storage.googleapis.com",
  FOLDER               : "userImages",
  FIREBASE_SERVICE_JSON: {
    "type"                       : "service_account",
    "project_id"                 : "fotd-60e29",
    "private_key_id"             : "f7ea4d0fc04a07b270f540f29ae843b538b44b57",
    "private_key"                : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8rKuRObTU3hnH\nvYUmpw5xWBhqv/fQKfVytWW12GdBuyws7qx/jgfKMRgXzYn+0a9Kz3pTJ0xRazKn\nksWF+nahKcMmuPDAZKBPywnYZvZC1BVdsa8cG66JDzPtQXa0wQ1WizPqHVYtO5vy\ntPe/QSpD7oAPYUg/YP69yOTQLUU4IsSL2FZfRijat1/qFBWJKXyE0KVVeUIXGh+j\nTEwnDYL94L2cPpnQ6pAU2IWB0HDq0innNrh8jG91fojBNAPevYay7WQC0xGWMS5K\nW9AOxUIXVFQ15LVDwloXm1qphHB14qB7zYLcmIlaA9yrRJjRQBcdiZa0sEYUETE3\nvQtQmRQVAgMBAAECggEAAIf5NsjCaVlXKTHRvREpkM8v1AKdynJIS+fRLlYSpyDY\nQtntsQp5B6jm91uNGvl+0wVZmjF7JKstw/E1z+m6ztT4WsbgzcyT2NLu37mrfFOB\nqSLdEwCzlZDOxqrL8P93ftl5wPuopf71MX+3IUNGgiPqdm9RXySKtWrw7Vb4YeaF\nYOkLxg1ldz0fjMTG31WAD/jGdGax6/RVh6GJR4Mk2ySsB2kDleYMLWNjyuGXreNQ\nQMAchNh6a9M4VDrvc+RQfIyG/veceYKV1FCIq9AtVYDGmK4EfGDitZaLE0HASD4f\nZT7lOS0CvFa7VLZ2lCChjaIGzFlwdpUpkWOkuM+O/QKBgQD0WDIy30QJjKfCxpVu\nT2wcq3WTWG0bZmjFAs0qrnOyUmXUVXmvaPrbBsAbm3E9lXlrsGk1GexwmvfnwgZf\n1kUlzmAGTk5shhiAFDPESJWwZUR8qS3+l74/LhAPdqnZ4l7oTw2icPL0C2LSJB/4\nFRSRX4LTF47vDa8BLlQvNVtLawKBgQDFrKlktm6cEJeCAp0SO45Lev2QMmZOSQql\nwgPIX6oRX6eZNT8zouXTyedfQX+8DlBGCNOK9VHmuy6GoAPovHT5vrrKQYkrttGZ\nGFlkG1iUoxP9c2ENE4wWc76GcTdsbw+qlFyTSUp0sUSn+EYEts/XdT5Q3B/0mdSX\nXoyLt5B+fwKBgAPoRSU7HMNqVGRw+ILDEl+C/mZUy6ncgWBlIxLDp2X6m1ZB56g+\nbYSDHx9R5QWvFjn6oDQRLg6+66fxGlj9/C0Wl8KCDg7+NfYWXJ2O65XeiLHVor6n\nfotUGT2mECFD1XCxku4+ECSG6hWiLkCxVZrdhCIMBmUcOugx7Xazy7nxAoGAOgaz\nOvMqiPl94BYwUXfWD2YtJLUGvxhF3d6UCa+7VppDsn+k6913pbHxD09E1clF2ykg\nH/xfbGGqCK7UNu+LTvykDFcskv55jH1PUEmOuSMd7Rp/dL02NCkJ1qFJabU4XhRr\nEHlFN/gJdV02AJBBdrfd8RKM9tppQ33nt+PMsLUCgYEA5MxLBCZ7uW2CBz91EglU\n3b8aNDQiuFNcYtQgVqeLh2GACWYXfJ2dOSfSE2eoP8SbU+rtgZs9eH1qUncR0vbG\nw6KhAe18Py8JCQmHFelAZzE5aL7reh9PRE/Q1ckHMziZKKKmh29yT3bVihrAiftS\n8EcoU6BzzJ1qOqukcLUgWeo=\n-----END PRIVATE KEY-----\n",
    "client_email"               : "fotd-cloud@fotd-60e29.iam.gserviceaccount.com",
    "client_id"                  : "105738279625623035455",
    "auth_uri"                   : "https://accounts.google.com/o/oauth2/auth",
    "token_uri"                  : "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url"       : "https://www.googleapis.com/robot/v1/metadata/x509/fotd-cloud%40fotd-60e29.iam.gserviceaccount.com"
  }
}

exports .FACT_STATUS = {
  "PENDING" : 0,
  "APPROVED": 1,
  "REJECTED": 2,
  "0"       : "PENDING",
  "1"       : "APPROVED",
  "2"       : "REJECTED"
}

exports.AVATAR = [
  "https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/userAvatars%2FAvatar_1.png?alt=media&token=74414203-43f9-4bc7-8a6c-0f5c258bf5b8",
  "https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/userAvatars%2FAvatar_2.png?alt=media&token=c79d4d91-6101-4500-8b20-d06cc1740dd8",
  "https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/userAvatars%2FAvatar_3.png?alt=media&token=cd783f2e-3a04-4113-9b5b-fb83e86b6dbd",
  "https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/userAvatars%2FAvatar_4.png?alt=media&token=f7a609fd-0eda-4126-9018-2fc295e48259",
  "https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/userAvatars%2FAvatar_5.png?alt=media&token=a07301ed-df38-49b4-8245-3f6f0a9bc03b",
  "https://firebasestorage.googleapis.com/v0/b/fotd-60e29.appspot.com/o/userAvatars%2FAvatar_6.png?alt=media&token=c88578e5-0225-4ccc-ab30-a301176a90c3",
]

exports.REWARD_POINT = {
  FACT_APPROVED: 5,
  FACT_LIKE    : 1
}