# CustomerOrdering 
A simple customer ordering system. This implementation focuses on the core concept of taking orders and connecting them to users and customizable drinks.

## Concept: CustomerOrdering

**Purpose**: Take each order and connect it to a user and a customizable drink  
**Principle**: You can place orders, track their status, and manage the order lifecycle

### Core State
- **Drinks**: Set of drinks with name, optional description, and customizable options
- **Orders**: Set of orders with user, drink, timestamp, and status (PLACED/SERVED/CANCELED)
- **Users**: Set of users referenced by orders

### Core Actions
- `placeOrder(user: User, drink: Drink): Order`
- `markServed(order: Order)`
- `cancelOrder(order: Order)`
- `placeVoiceOrder(user: User, text: string): Order` - AI-assisted natural language order processing

## AI Augmentation

The system includes AI-powered natural language processing to convert spoken or typed orders into structured order objects. The `placeVoiceOrder` action uses AI to parse customer requests like "I'd like a large coffee with extra shot and oat milk" and automatically matches it to available drinks and options, creating a proper order object with all the necessary details.

![Voice Ordering Interface](../assets/sketch/voice-ordering.png)

### User Journey
When a customer approaches the counter, the cashier activates voice mode instead of navigating through multiple menu screens. As the customer speaks their order naturally—"I'll have a grande caramel macchiato with almond milk and an extra shot"—the system listens and processes the request in real-time. The cashier repeats the order back to confirm accuracy, and the POS system automatically detects and parses the order details, populating the order screen with the correct drink, size, and customizations. The cashier can then quickly review the generated order, make any necessary adjustments to quantities or special instructions, and proceed directly to payment processing. This streamlined workflow eliminates the need for manual menu navigation and reduces order-taking time while maintaining accuracy through AI-powered natural language understanding.

### Test Case Analysis

**Test Case 1: Basic Voice Ordering**
Our approach focused on establishing baseline functionality with simple, clear orders. The prompt emphasizes basic drink recognition and common customizations like size and milk type. What worked well was the straightforward parsing of clear drink names and basic customizations. However, the system may struggle with drink name variations (e.g., "coffee" vs "black coffee" vs "regular coffee") and might not handle cases where the exact drink name isn't used. Key issues remaining include the need for better drink name matching algorithms and fallback strategies for ambiguous requests.

**Test Case 2: Complex Customization Order**
This test evaluates the system's ability to handle real-world ordering complexity with multiple customizations. The prompt emphasizes handling multiple customizations simultaneously, including temperature preferences and multiple modifiers. The system successfully demonstrates parsing detailed requests, but may struggle with conflicting customizations (e.g., "extra hot" vs "iced") and might not validate that customizations make sense together. Remaining issues include the need for validation logic for conflicting customizations and better handling of temperature preferences across different drink types.

**Test Case 3: Order Management Workflow**
This comprehensive test evaluates the full order lifecycle with multiple orders and status changes. The approach tests scalability and the ability to handle different order complexities simultaneously. While the system demonstrates handling multiple orders, it may struggle with order tracking when multiple orders are placed quickly and might not handle order modifications gracefully. Key issues remaining include the need for better order tracking, modification handling, and status management for complex workflows.

### LLM Validation Issues

**Issue 1: Drink Hallucination** - The LLM may generate drink names that don't exist in the menu, such as creating "Caramel Latte" when only "Latte" is available, or inventing entirely new drinks like "Mocha Frappuccino" when no such drink exists. This could lead to orders for non-existent items.

**Issue 2: Invalid Customization Conflicts** - The LLM might generate conflicting customizations that don't make logical sense together, such as ordering a drink "extra hot" and "iced" simultaneously, or requesting "decaf" for drinks that don't have caffeine options. These conflicts could result in impossible orders.

**Issue 3: Customization Value Mismatches** - The LLM could provide customization values that don't match the available options for a specific drink, such as requesting "venti" size for a drink that only comes in "small, medium, large", or asking for "soy milk" when only "oat milk" and "almond milk" are available. This could lead to orders with invalid specifications.

## Prerequisites

- **Node.js** (version 14 or higher)
- **TypeScript** (will be installed automatically)
- **Google Gemini API Key** (free at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Quick Setup

### 0. Clone the repo locally and navigate to it
```cd 60140-assignment-3```

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your API Key

**Why use a template?** The `config.json` file contains your private API key and should never be committed to version control. The template approach lets you:
- Keep the template file in git (safe to share)
- Create your own `config.json` locally (keeps your API key private)
- Easily set up the project on any machine

**Step 1:** Copy the template file:
```bash
cp config.json.template config.json
```

**Step 2:** Edit `config.json` and add your API key:
```json
{
  "apiKey": "YOUR_GEMINI_API_KEY_HERE"
}
```

**To get your API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into `config.json` (replacing `YOUR_GEMINI_API_KEY_HERE`)

### 3. Run the Application

**Run all test cases:**
```bash
npm start
```

**Run specific test cases:**
```bash
npm run manual    # Manual ordering only
npm run llm       # LLM-assisted voice ordering only
npm run mixed     # Mixed manual + LLM ordering
```

## File Structure

```
customerordering/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── config.json               # Your Gemini API key
├── customerorder.ts           # CustomerOrdering class implementation
├── gemini-llm.ts             # LLM integration
├── customerordering-tests.ts  # Test cases and examples
├── customerordering.spec     # Concept specification
├── dist/                     # Compiled JavaScript output
└── README.md                 # This file
```

## Test Cases

The application includes three comprehensive test cases:

### 1. Basic Voice Ordering
Demonstrates simple voice order processing and order management:

```typescript
const ordering = new CustomerOrdering();
ordering.addDrink('Coffee', 'Freshly brewed coffee', { 
    sizes: ['small', 'medium', 'large'], 
    milk: ['whole', 'skim', 'oat', 'almond'] 
});
const order = await ordering.placeVoiceOrder("I'd like a large coffee with oat milk", llm);
ordering.markServed(order);
```

### 2. Complex Customization Order
Shows AI-powered processing of complex orders with multiple customizations:

```typescript
const ordering = new CustomerOrdering();
ordering.addDrink('Caramel Macchiato', 'Espresso with vanilla syrup', {
    sizes: ['tall', 'grande', 'venti'],
    milk: ['whole', 'skim', 'oat', 'almond'],
    shots: ['single', 'double', 'triple'],
    temperature: ['hot', 'iced']
});
const order = await ordering.placeVoiceOrder("Give me a venti caramel macchiato, hot, with almond milk and a double shot", llm);
```

### 3. Order Management Workflow
Combines multiple orders with order lifecycle management and cancellations.

## Sample Output

```
☕ Available Drinks
==================
- Coffee - Freshly brewed coffee
- Latte - Espresso with steamed milk
- Cappuccino - Espresso with foamed milk

📋 Current Orders
==================
🟡 PLACED ORDERS:
  2:30:15 PM - Coffee (size: large, milk: oat) [PLACED]

🟢 SERVED ORDERS:
  2:25:10 PM - Latte (size: medium, milk: almond) [SERVED]

🔴 CANCELED ORDERS:
  2:20:05 PM - Cappuccino (size: small, milk: whole) [CANCELED]
```

## Key Features

- **Simple State Management**: Drinks and orders stored in memory
- **Flexible Customization System**: Support for various drink options and customizations
- **Query-Based Display**: Orders and menu generated on-demand, not stored sorted
- **AI Integration**: Natural language processing for voice ordering with validation
- **Order Lifecycle Management**: Track orders from PLACED to SERVED or CANCELED
- **Clean Architecture**: First principles implementation with comprehensive validation

## LLM Validation Rules (Hardwired)

The AI uses these built-in validation rules:
- Temperature: Only "hot" or "iced" - no variations like "extra hot" or "cold"
- Milk: Only "whole", "skim", "almond", or "oat" - no "soy milk" or "coconut milk"
- Shots: Only "single", "double", or "triple" - no "extra shot" or "additional shot"
- Sizes: Must match available options for each drink (small/medium/large OR tall/grande/venti)
- Drink Names: Must exactly match drinks in the menu - no hallucination of new drinks
- Customization Conflicts: Prevents impossible combinations like "iced" and "hot" together

## Troubleshooting

### "Could not load config.json"
- Ensure `config.json` exists with your API key
- Check JSON format is correct

### "Error calling Gemini API"
- Verify API key is correct
- Check internet connection
- Ensure API access is enabled in Google AI Studio

### Build Issues
- Use `npm run build` to compile TypeScript
- Check that all dependencies are installed with `npm install`

## Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
