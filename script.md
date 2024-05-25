"Hello everyone,

Today, I'd like to demonstrate my implementation for the Linagora job test. To save time, I'll start by showing you my REST API implementation. Here is my code (show code on screen), which follows Domain-Driven Design (DDD) and Functional Programming principles. The REST API part is implemented using Express.js.

First, let's create a new user named Bob. This will give us a new user ID, which I'll note for later use. Next, I'll create an account for Bob (using Postman). This account starts with an initial balance, which we can check using the account detail endpoint. Each new account begins with a balance of ten dollars, as you can see.

Now, I'll create a second user named Bob2, and similarly, create an account for this user with an initial balance of ten dollars.

Let's test transferring money from one account to another. I’ll transfer nine dollars from Bob's account to Bob2's account. The transfer should succeed since the amount is less than the sender's balance. We'll verify that Bob's account balance is reduced by nine dollars and Bob2's account balance is increased by nine dollars.

Next, I'll demonstrate what happens if we try to transfer more money than the sender’s balance. Since Bob's account now has only one dollar left, transferring nine dollars should fail. (Using Postman) We receive a 400 Bad Request error. Checking the transaction details, we see it failed due to insufficient funds.

Now, let me explain the architecture of my implementation. I’ve divided the code into two main components to separate the core domain logic from the infrastructure concerns, following DDD principles. In the core, we have three main domains: User, Account, and Transaction. Business logic resides in these domain models, and domain services handle complex operations like creating accounts and transferring money.

Domain Services and Tactical Design
According to DDD tactical design, logic that involves multiple entities or aggregates, especially when it entails complex workflows or side effects, should be moved to domain services. This separation keeps the domain models clean and focused on their core responsibilities, enhancing maintainability and clarity. For example, while an Account entity might handle basic balance operations, a domain service would manage the entire transfer process, coordinating between multiple accounts and ensuring all business rules are enforced.

Event-Driven Architecture
These services emit domain events when side effects or complex processes are involved. Using domain events to manage business processes allows the system to remain extensible and decoupled. When a transfer is initiated, an event such as MoneyTransferred can trigger various listeners, handling persistence, notifications, or integration with external systems without modifying the core logic. This approach aligns with the principles of event-driven architecture, ensuring that each part of the process is independently manageable and scalable.

Event-driven programming is particularly beneficial for handling the long-running processes and complex workflows inherent in financial transactions. It ensures that each step of the process is executed reliably and can be independently monitored and managed. This approach also supports eventual consistency and enhances the system's ability to handle complex scenarios gracefully.

Architectural Overview
Using DDD principles, the domain models encapsulate the essential business rules and logic. Domain services orchestrate business operations that span multiple models, ensuring the application logic remains clean and maintainable. By emitting events, the system decouples the core business logic from the infrastructure, promoting scalability and flexibility. Event listeners in the infrastructure handle these events, performing necessary side effects like persisting data or integrating with external systems.

This event-driven approach ensures that the business logic remains pure and focused on business rules, while the infrastructure handles the operational concerns. It also facilitates easy integration with other systems and components, making the system more flexible and adaptable to changing requirements.

Thank you for your attention and patience. I'm happy to answer any questions you might have."
