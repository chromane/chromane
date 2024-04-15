type JetInsightQuote = {
    FIRST_NAME: string
    LAST_NAME: string
    PHONE: string
    EMAIL: string
    TRIP_TYPE: TripTypeOneWay | TripTypeRoundTrip | TripTypeMultiCity
    COMMENTS: string
    HOW_DID_YOU_HEAR_ABOUT_US: HowDidYouHearAboutUs
}

type HowDidYouHearAboutUs =
    "referral_source_none" |
    "referral_source_friend" |
    "referral_source_phone" |
    "referral_source_website" |
    "referral_source_email" |
    "referral_source_letter" |
    "referral_source_postcard" |
    "referral_source_google" |
    "referral_source_facebook" |
    "referral_source_instagram" |
    "referral_source_print_ad" |
    "referral_source_online_ad" |
    "referral_source_billboard" |
    "referral_source_other";

type TripTypeOneWay = {
    FROM: string
    TO: string
    PASSENGERS: string
    DEPART: {
        DATE: string
        TIME: string
    }
}

type TripTypeRoundTrip = {
    FROM: string
    TO: string
    PASSENGERS: string
    DEPART: {
        DATE: string
        TIME: string
    }
    RETURN: {
        DATE: string
        TIME: string
    }
}

type TripTypeMultiCity = {
    PASSENGERS: string

    listOfTrips: {
        FROM: string
        TO: string
        DEPART: {
            DATE: string
            TIME: string
        }
    }[]
}