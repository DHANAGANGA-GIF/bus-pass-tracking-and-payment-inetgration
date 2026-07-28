# Architecture Diagram

## Context Level

```mermaid
graph TD
    subgraph External Systems
        PaymentGateway[Payment Gateway (Razorpay/Stripe)]
        EmailService[Email Service (Resend/SES)]
        SMSService[SMS Service (MSG91/Twilio)]
        PushNotificationService[Push Notification Service (FCM)]
        StorageService[Storage Service (AWS S3/Cloudinary)]
        MonitoringService[Monitoring (Sentry, Prometheus, Grafana)]
    end

    subgraph Users
        Passenger[Passenger]
        Admin[Admin]
        SuperAdmin[Super Admin]
    end

    subgraph BusPassPlatform[Bus Pass Booking Platform]
        WebApp[Web Application (Next.js)]
        AdminApp[Admin Portal (Next.js)]
        SuperAdminApp[Super Admin Portal (Next.js)]
        API[API Server (Node.js/Express)]
        Database[(PostgreSQL Database)]
        Cache[(Redis Cache)]
        Queue[(Message Queue - BullMQ)]
        Storage[Storage Service]
        NotificationService[Notification Service]
        AuthService[Authentication Service]
        PaymentService[Payment Service]
        ReportingService[Reporting Service]
    end

    Passenger -->|Uses| WebApp
    Admin -->|Uses| AdminApp
    SuperAdmin -->|Uses| SuperAdminApp

    WebApp -->|API Calls| API
    AdminApp -->|API Calls| API
    SuperAdminApp -->|API Calls| API

    API -->|Read/Write| Database
    API -->|Read/Write| Cache
    API -->|Publish/Consume| Queue
    API -->|Uses| StorageService
    API -->|Uses| EmailService
    API -->|Uses| SMSService
    API -->|Uses| PushNotificationService
    API -->|Uses| PaymentGateway
    API -->|Logs/Metrics| MonitoringService

    NotificationService -->|Read/Write| Database
    NotificationService -->|Publish/Consume| Queue
    NotificationService -->|Uses| EmailService
    NotificationService -->|Uses| SMSService
    NotificationService -->|Uses| PushNotificationService

    PaymentService -->|Read/Write| Database
    PaymentService -->|Publish/Consume| Queue
    PaymentService -->|Uses| PaymentGateway
    PaymentService -->|Logs/Metrics| MonitoringService

    AuthService -->|Read/Write| Database
    AuthService -->|Publish/Consume| Queue
    AuthService -->|Logs/Metrics| MonitoringService

    ReportingService -->|Read/Write| Database
    ReportingService -->|Publish/Consume| Queue
    ReportingService -->|Logs/Metrics| MonitoringService
```

## Container Level

```mermaid
graph TD
    subgraph WebApp[Web Application (Next.js)]
        NextJSApp[Next.js App Router]
        ReactComponents[React Components]
        Tailwind[Tailwind CSS]
        ShadCN[ShadCN UI]
        FramerMotion[Framer Motion]
        ReactHookForm[React Hook Form]
        Zod[Zod]
        TanStackQuery[TanStack Query]
        Zustand[Zustand]
    end

    subgraph AdminApp[Admin Portal (Next.js)]
        NextJSAdmin[Next.js App Router]
        ReactComponentsAdmin[React Components]
        TailwindAdmin[Tailwind CSS]
        ShadCNAdmin[ShadCN UI]
        FramerMotionAdmin[Framer Motion]
        ReactHookFormAdmin[React Hook Form]
        ZodAdmin[Zod]
        TanStackQueryAdmin[TanStack Query]
        ZustandAdmin[Zustand]
    end

    subgraph SuperAdminApp[Super Admin Portal (Next.js)]
        NextJSSuperAdmin[Next.js App Router]
        ReactComponentsSuperAdmin[React Components]
        TailwindSuperAdmin[Tailwind CSS]
        ShadCNSuperAdmin[ShadCN UI]
        FramerMotionSuperAdmin[Framer Motion]
        ReactHookFormSuperAdmin[React Hook Form]
        ZodSuperAdmin[Zod]
        TanStackQuerySuperAdmin[TanStack Query]
        ZustandSuperAdmin[Zustand]
    end

    subgraph API[API Server (Node.js/Express)]
        ExpressServer[Express.js Server]
        Controllers[Controllers]
        Services[Services]
        Repositories[Repositories]
        Middleware[Middleware]
        Validators[Validators]
        Utils[Utilities]
        Config[Configuration]
    end

    subgraph Database[(PostgreSQL Database)]
        Users[Users Table]
        Admins[Admins Table]
        Roles[Roles Table]
        Permissions[Permissions Table]
        Routes[Routes Table]
        Buses[Buses Table]
        Schedules[Schedules Table]
        Bookings[Bookings Table]
        BusPasses[BusPasses Table]
        Payments[Payments Table]
        Transactions[Transactions Table]
        Invoices[Invoices Table]
        Receipts[Receipts Table]
        Notifications[Notifications Table]
        EmailLogs[EmailLogs Table]
        SMSLogs[SMSLogs Table]
        PushNotificationLogs[PushNotificationLogs Table]
        OTPs[OTPs Table]
        RefreshTokens[RefreshTokens Table]
        Sessions[Sessions Table]
        AuditLogs[AuditLogs Table]
        ActivityLogs[ActivityLogs Table]
        Files[Files Table]
        Settings[Settings Table]
    end

    subgraph Cache[(Redis Cache)]
        SessionsCache[Sessions Cache]
        OTPCache[OTP Cache]
        RateLimitingCache[Rate Limiting Cache]
        APIResponseCache[API Response Cache]
    end

    subgraph Queue[(Message Queue - BullMQ)]
        NotificationQueue[Notification Queue]
        PaymentQueue[Payment Queue]
        EmailQueue[Email Queue]
        SMSQueue[SMS Queue]
        PushNotificationQueue[Push Notification Queue]
        ReportQueue[Report Queue]
    end

    WebApp -->|API Calls| API
    AdminApp -->|API Calls| API
    SuperAdminApp -->|API Calls| API

    API -->|Read/Write| Database
    API -->|Read/Write| Cache
    API -->|Publish/Consume| Queue

    NotificationService -->|Read/Write| Database
    NotificationService -->|Publish/Consume| Queue

    PaymentService -->|Read/Write| Database
    PaymentService -->|Publish/Consume| Queue

    AuthService -->|Read/Write| Database
    AuthService -->|Publish/Consume| Queue

    ReportingService -->|Read/Write| Database
    ReportingService -->|Publish/Consume| Queue

    API -->|Uses| StorageService
    API -->|Uses| EmailService
    API -->|Uses| SMSService
    API -->|Uses| PushNotificationService
    API -->|Uses| PaymentGateway
    API -->|Logs/Metrics| MonitoringService

    style WebApp fill:#f9f,stroke:#333,stroke-width:2px
    style AdminApp fill:#f9f,stroke:#333,stroke-width:2px
    style SuperAdminApp fill:#f9f,stroke:#333,stroke-width:2px
    style API fill:#bbf,stroke:#333,stroke-width:2px
    style Database fill:#bfb,stroke:#333,stroke-width:2px
    style Cache fill:#bfb,stroke:#333,stroke-width:2px
    style Queue fill:#bfb,stroke:#333,stroke-width:2px
    style StorageService fill:#ff9,stroke:#333,stroke-width:2px
    style EmailService fill:#ff9,stroke:#333,stroke-width:2px
    style SMSService fill:#ff9,stroke:#333,stroke-width:2px
    style PushNotificationService fill:#ff9,stroke:#333,stroke-width:2px
    style PaymentGateway fill:#ff9,stroke:#333,stroke-width:2px
    style MonitoringService fill:#f99,stroke:#333,stroke-width:2px
```

## Component Level (Example: API Server)

```mermaid
graph TD
    subgraph API_Server[API Server (Node.js/Express)]
        HTTP_Server[HTTP Server (Express)]
        Middleware[Middleware]
            AuthMiddleware[Authentication Middleware]
            RBACMiddleware[RBAC Middleware]
            ValidationMiddleware[Validation Middleware]
            RateLimitMiddleware[Rate Limiting Middleware]
            LoggingMiddleware[Logging Middleware]
            ErrorHandlingMiddleware[Error Handling Middleware]
        Controllers[Controllers]
            AuthController[Auth Controller]
            UserController[User Controller]
            BookingController[Booking Controller]
            PaymentController[Payment Controller]
            AdminController[Admin Controller]
            SuperAdminController[Super Admin Controller]
            NotificationController[Notification Controller]
            ReportingController[Reporting Controller]
        Services[Services]
            AuthService[Auth Service]
            UserService[User Service]
            BookingService[Booking Service]
            PaymentService[Payment Service]
            NotificationService[Notification Service]
            AdminService[Admin Service]
            SuperAdminService[Super Admin Service]
            ReportingService[Reporting Service]
        Repositories[Repositories]
            UserRepository[User Repository]
            AdminRepository[Admin Repository]
            RoleRepository[Role Repository]
            PermissionRepository[Permission Repository]
            RouteRepository[Route Repository]
            BusRepository[Bus Repository]
            ScheduleRepository[Schedule Repository]
            BookingRepository[Booking Repository]
            BusPassRepository[BusPass Repository]
            PaymentRepository[Payment Repository]
            TransactionRepository[Transaction Repository]
            InvoiceRepository[Invoice Repository]
            ReceiptRepository[Receipt Repository]
            NotificationRepository[Notification Repository]
            EmailLogRepository[EmailLog Repository]
            SMSLogRepository[SMSLog Repository]
            PushNotificationLogRepository[PushNotificationLog Repository]
            OTPRepository[OTP Repository]
            RefreshTokenRepository[RefreshToken Repository]
            SessionRepository[Session Repository]
            AuditLogRepository[AuditLog Repository]
            ActivityLogRepository[ActivityLog Repository]
            FileRepository[File Repository]
            SettingsRepository[Settings Repository]
        Utils[Utils]
            PasswordUtils[Password Hashing (Argon2)]
            TokenUtils[Token Handling (JWT)]
            ValidationUtils[Validation (Zod)]
            EmailUtils[Email Templating]
            SMSUtils[SMS Templating]
            PaymentUtils[Payment Validation]
            QRUtils[QR Code Generation]
            FileUtils[File Upload/Download]
            Logger[Logger (Pino)]
        Config[Configuration]
            DBConfig[Database Config]
            CacheConfig[Cache Config]
            QueueConfig[Queue Config]
            StorageConfig[Storage Config]
            EmailConfig[Email Config]
            SMSConfig[SMS Config]
            PushNotificationConfig[Push Notification Config]
            PaymentConfig[Payment Config]
            AuthConfig[Auth Config]
            AppConfig[App Config]
    end

    HTTP_Server -->|Routes| Controllers
    HTTP_Server -->|Global Middleware| Middleware
    Controllers -->|Use| Services
    Services -->|Use| Repositories
    Services -->|Use| Utils
    Repositories -->|Database| Database
    Repositories -->|Cache| Cache
    Repositories -->|Queue| Queue
    Services -->|External| PaymentGateway
    Services -->|External| EmailService
    Services -->|External| SMSService
    Services -->|External| PushNotificationService
    Services -->|External| StorageService
    Services -->|External| MonitoringService
```

Note: The component diagram for the API server is shown as an example. Similar diagrams can be created for other services (NotificationService, PaymentService, AuthService, ReportingService) if they are separated into microservices. However, in this monolithic architecture, they are part of the API server.