<concept_spec>
concept CustomerOrdering

purpose
    take each order and connect it to a user and a customizable drink

principle
    drinks are defined with names, descriptions, and customizable options;
    orders are placed by users for specific drinks;
    orders have a status that can be tracked and updated;
    you can use an LLM to process natural language orders into structured order objects

state
    a set of Drink with
        a name String
        an optional description String
        an options GenericObject // customizable options like size, milk type, etc.

    a set of Order with
        a user User
        a drink Drink
        an orderedAt DateTime
        a status OrderStatus // PLACED, SERVED, or CANCELED

    a set of User with
        a userId String
        a name String

    invariants
        every order's user must reference a valid User
        every order's drink must exist in the Drink set
        order status must be one of PLACED, SERVED, or CANCELED

actions    
    placeOrder(user: User, drink: Drink): Order
        requires user exists and drink exists
        effect creates fresh order with user, drink, current timestamp, and PLACED status
        returns the created order

    markServed(order: Order)
        requires order exists and status is PLACED
        effect updates order status to SERVED

    cancelOrder(order: Order)
        requires order exists and status is PLACED
        effect updates order status to CANCELED

    async placeVoiceOrder(user: User, text: String, llm: GeminiLLM): Order
        requires user exists and text is non-empty
        effect uses llm to parse natural language text into drink selection and options,
        creates order with parsed drink and user, current timestamp, and PLACED status
        returns the created order

notes
    This concept demonstrates order management with AI-powered natural language processing.
    The voice ordering feature allows customers to place orders using natural speech,
    which is then parsed by an LLM to extract drink details and customizations.
    
</concept_spec>
