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
npm run manual    # Manual scheduling only
npm run llm       # LLM-assisted scheduling only
npm run mixed     # Mixed manual + LLM scheduling
```

## File Structure

```
dayplanner/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── config.json               # Your Gemini API key
├── dayplanner-types.ts       # Core type definitions
├── dayplanner.ts             # DayPlanner class implementation
├── dayplanner-llm.ts         # LLM integration
├── dayplanner-tests.ts       # Test cases and examples
├── dist/                     # Compiled JavaScript output
└── README.md                 # This file
```

## Test Cases

The application includes three comprehensive test cases:

### 1. Manual Scheduling
Demonstrates adding activities and manually assigning them to time slots:

```typescript
const planner = new DayPlanner();
const breakfast = planner.addActivity('Breakfast', 1); // 30 minutes
planner.assignActivity(breakfast, 14); // 7:00 AM
```

### 2. LLM-Assisted Scheduling
Shows AI-powered scheduling with hardwired preferences:

```typescript
const planner = new DayPlanner();
planner.addActivity('Morning Jog', 2);
planner.addActivity('Math Homework', 4);
await llm.requestAssignmentsFromLLM(planner);
```

### 3. Mixed Scheduling
Combines manual assignments with AI assistance for remaining activities.

## Sample Output

```
📅 Daily Schedule
==================
7:00 AM - Breakfast (30 min)
8:00 AM - Morning Workout (1 hours)
10:00 AM - Study Session (1.5 hours)
1:00 PM - Lunch (30 min)
3:00 PM - Team Meeting (1 hours)
7:00 PM - Dinner (30 min)
9:00 PM - Evening Reading (1 hours)

📋 Unassigned Activities
========================
All activities are assigned!
```

## Key Features

- **Simple State Management**: Activities and assignments stored in memory
- **Flexible Time System**: Half-hour slots from midnight (0-47)
- **Query-Based Display**: Schedule generated on-demand, not stored sorted
- **AI Integration**: Hardwired preferences in LLM prompt (no external hints)
- **Conflict Detection**: Prevents overlapping activities
- **Clean Architecture**: First principles implementation with no legacy code

## LLM Preferences (Hardwired)

The AI uses these built-in preferences:
- Exercise activities: Morning (6:00 AM - 10:00 AM)
- Study/Classes: Focused hours (9:00 AM - 5:00 PM)
- Meals: Regular intervals (breakfast 7-9 AM, lunch 12-1 PM, dinner 6-8 PM)
- Social/Relaxation: Evenings (6:00 PM - 10:00 PM)
- Avoid: Demanding activities after 10:00 PM

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

## Next Steps

Try extending the DayPlanner:
- Add weekly scheduling
- Implement activity categories
- Add location information
- Create a web interface
- Add conflict resolution strategies
- Implement recurring activities

## Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
