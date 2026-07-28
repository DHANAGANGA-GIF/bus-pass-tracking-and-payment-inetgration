# Entity Relationship Diagram

```mermaid
erDiagram
    USER ||..|ROLE : has
    USER ||..|SESSION : has
    USER ||..|REFRESH_TOKEN : has
    USER ||..|OTP : has
    USER ||..|SESSION : has
    USER ||..|AUDIT_LOG : creates
    USER ||..|ACTIVITY_LOG : performs
    USER ||..|FILE : uploads
    USER ||..|BOOKING : makes
    USER ||..|BUS_PASS : owns
    USER ||..|PAYMENT : makes
    USER ||..|TRANSACTION : makes
    USER ||..|INVOICE : generates
    USER ||..|RECEIPT : generates
    USER ||..|NOTIFICATION : receives
    USER ||..|EMAIL_LOG : receives
    USER ||..|SMS_LOG : receives
    USER ||..|PUSH_NOTIFICATION_LOG : receives

    ADMIN ||..|ROLE : has
    ADMIN ||..|SESSION : has
    ADMIN ||..|REFRESH_TOKEN : has
    ADMIN ||..|OTP : has
    ADMIN ||..|SESSION : has
    ADMIN ||..|AUDIT_LOG : creates
    ADMIN ||..|ACTIVITY_LOG : performs
    ADMIN ||..|FILE : uploads
    ADMIN ||..|ROUTE : manages
    ADMIN ||..|BUS : manages
    ADMIN ||..|SCHEDULE : manages
    ADMIN ||..|PAYMENT : manages
    ADMIN ||..|TRANSACTION : manages
    ADMIN ||..|REFUND : processes
    ADMIN ||..|PASS_VERIFICATION : performs
    ADMIN ||..|NOTIFICATION : sends
    ADMIN ||..|EMAIL_LOG : sends
    ADMIN ||..|SMS_LOG : sends
    ADMIN ||..|PUSH_NOTIFICATION_LOG : sends
    ADMIN ||..|SETTINGS : manages

    ROLE }|..|{ PERMISSION : has
    PERMISSION }|..|{ ROLE : granted_to

    ROUTE }|..|{ BUS : assigns
    ROUTE }|..|{ SCHEDULE : has
    SCHEDULE }|..|{ BUS : assigned

    BOOKING }|..|{ USER : made_by
    BOOKING }|..|{ ROUTE : for_route
    BOOKING }|..|{ SCHEDULE : for_schedule
    BOOKING }|..|{ BUS_PASS : generates
    BOOKING }|..|{ PAYMENT : triggers
    BOOKING }|..|{ INVOICE : generates
    BOOKING }|..|{ RECEIPT : generates

    BUS_PASS }|..|{ USER : owned_by
    BUS_PASS }|..|{ BOOKING : from_booking
    BUS_PASS }|..|{ PAYMENT : verified_by

    PAYMENT }|..|{ BOOKING : for_booking
    PAYMENT }|..|{ TRANSACTION : recorded_as
    PAYMENT }|..|{ INVOICE : generates
    PAYMENT }|..|{ RECEIPT : generates

    TRANSACTION }|..|{ PAYMENT : from_payment
    TRANSACTION }|..|{ INVOICE : related_to
    TRANSACTION }|..|{ RECEIPT : related_to

    INVOICE }|..|{ PAYMENT : from_payment
    INVOICE }|..|{ BOOKING : for_booking

    RECEIPT }|..|{ PAYMENT : from_payment
    RECEIPT }|..|{ BOOKING : for_booking

    NOTIFICATION }|..|{ USER : for_user
    NOTIFICATION }|..|{ ADMIN : for_admin
    NOTIFICATION }|..|{ EVENT_TYPE : of_type

    EMAIL_LOG }|..|{ NOTIFICATION : triggers
    SMS_LOG }|..|{ NOTIFICATION : triggers
    PUSH_NOTIFICATION_LOG }|..|{ NOTIFICATION : triggers

    OTP }|..|{ USER : for_user
    OTP }|..|{ ADMIN : for_admin

    REFRESH_TOKEN }|..|{ USER : for_user
    REFRESH_TOKEN }|..|{ ADMIN : for_admin

    SESSION }|..|{ USER : for_user
    SESSION }|..|{ ADMIN : for_admin

    AUDIT_LOG }|..|{ USER : performed_by
    AUDIT_LOG }|..|{ ADMIN : performed_by

    ACTIVITY_LOG }|..|{ USER : performed_by
    ACTIVITY_LOG }|..|{ ADMIN : performed_by

    FILE }|..|{ USER : uploaded_by
    FILE }|..|{ ADMIN : uploaded_by

    SETTINGS }|..|{ ADMIN : managed_by
```