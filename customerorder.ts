/**
 * CustomerOrdering Concept - AI Augmented Version
 */

import { GeminiLLM } from './gemini-llm';

// Order status enum
export enum OrderStatus {
    PLACED = 'PLACED',
    SERVED = 'SERVED',
    CANCELED = 'CANCELED'
}

// A drink that can be ordered
export interface Drink {
    name: string;
    description?: string;
    options: Record<string, any>; // customizable options like size, milk type, etc.
}

// An order placed by a customer
export interface Order {
    drink: Drink;
    orderedAt: Date;
    status: OrderStatus;
}

export class CustomerOrdering {
    private drinks: Drink[] = [];
    private orders: Order[] = [];

    /**
     * Add a drink to the menu
     */
    addDrink(name: string, description?: string, options: Record<string, any> = {}): Drink {
        const drink: Drink = {
            name,
            description,
            options
        };
        this.drinks.push(drink);
        return drink;
    }

    /**
     * Place an order for a specific drink
     */
    placeOrder(drink: Drink): Order {
        if (!this.drinks.includes(drink)) {
            throw new Error('Drink must exist in the menu to place an order');
        }

        const order: Order = {
            drink,
            orderedAt: new Date(),
            status: OrderStatus.PLACED
        };

        this.orders.push(order);
        return order;
    }

    /**
     * Mark an order as served
     */
    markServed(order: Order): void {
        if (!this.orders.includes(order)) {
            throw new Error('Order does not exist');
        }

        if (order.status !== OrderStatus.PLACED) {
            throw new Error('Only PLACED orders can be marked as SERVED');
        }

        order.status = OrderStatus.SERVED;
    }

    /**
     * Cancel an order
     */
    cancelOrder(order: Order): void {
        if (!this.orders.includes(order)) {
            throw new Error('Order does not exist');
        }

        if (order.status !== OrderStatus.PLACED) {
            throw new Error('Only PLACED orders can be canceled');
        }

        order.status = OrderStatus.CANCELED;
    }

    /**
     * Place an order using natural language with AI assistance
     */
    async placeVoiceOrder(text: string, llm: GeminiLLM): Promise<Order> {
        try {
            console.log('🤖 Processing voice order with Gemini AI...');
            console.log(`📝 Customer said: "${text}"`);

            if (!text || text.trim().length === 0) {
                throw new Error('Order text cannot be empty');
            }

            const prompt = this.createVoiceOrderPrompt(text);
            const response = await llm.executeLLM(prompt);

            console.log('✅ Received response from Gemini AI!');
            console.log('\n🤖 RAW GEMINI RESPONSE');
            console.log('======================');
            console.log(response);
            console.log('======================\n');

            // Parse and create the order
            const drink = this.parseVoiceOrderResponse(response, text);
            const order = this.placeOrder(drink);

            console.log(`✅ Created order: ${drink.name} (${order.status})`);
            return order;

        } catch (error) {
            console.error('❌ Error processing voice order:', (error as Error).message);
            throw error;
        }
    }

    /**
     * Create the prompt for Gemini to parse natural language orders
     */
    private createVoiceOrderPrompt(orderText: string): string {
        const availableDrinks = this.drinks.map(drink => {
            const description = drink.description ? ` - ${drink.description}` : '';
            const options = Object.keys(drink.options).length > 0
                ? ` (Options: ${Object.keys(drink.options).join(', ')})`
                : '';
            return `- ${drink.name}${description}${options}`;
        }).join('\n');

        return `
You are a helpful AI assistant that processes natural language drink orders for a coffee shop.

AVAILABLE DRINKS:
${availableDrinks}

CUSTOMER ORDER: "${orderText}"

Your task is to:
1. Identify which drink the customer wants from the available drinks list
2. Extract any customizations or options they mentioned
3. Return a JSON object with the drink details

COMMON DRINK CUSTOMIZATIONS:
- Size: small, medium, large, grande, venti
- Milk: whole, skim, almond, oat
- Shots: single, double, triple
- Temperature: hot, iced (ONLY these two options - do not use "extra hot", "cold", or other variations)
- Sweetness: no sugar, extra sugar, sweetener
- Flavor: vanilla, caramel, hazelnut, mocha, etc.

Return your response as a JSON object with this exact structure:
{
  "drinkName": "exact name from available drinks list",
  "customizations": {
    "size": "medium",
    "milk": "oat",
    "shots": "double",
    "temperature": "hot",
    "flavor": "vanilla"
  }
}

IMPORTANT: Only use the exact customization values listed above. Do not invent new values like "extra hot", "cold", "soy milk", etc.

CRITICAL RULES:
- For temperature, ONLY use "hot" or "iced" - never use "extra hot", "cold", "warm", or any other variations
- For milk, ONLY use "whole", "skim", "almond", or "oat" - never use "soy milk", "coconut milk", etc.
- For shots, ONLY use "single", "double", or "triple" - never use "extra shot", "additional shot", etc.
- For sizes, use the exact sizes available for each drink (small/medium/large OR tall/grande/venti)

If the customer mentions a drink that doesn't exist in our menu, try to match it to the closest available drink.
If no customizations are mentioned, use reasonable defaults.
Return ONLY the JSON object, no additional text.`;
    }

    /**
     * Parse the LLM response and create a drink object
     */
    private parseVoiceOrderResponse(responseText: string, originalText: string): Drink {
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const response = JSON.parse(jsonMatch[0]);

            if (!response.drinkName) {
                throw new Error('Response missing drinkName');
            }

            // Find the drink in our menu
            const drink = this.drinks.find(d => d.name.toLowerCase() === response.drinkName.toLowerCase());
            if (!drink) {
                throw new Error(`Drink "${response.drinkName}" not found in menu`);
            }

            // Validate LLM response for logical issues
            this.validateLLMResponse(response, drink, originalText);

            // Create a customized version of the drink and add it to the menu
            const customizedDrink: Drink = {
                name: drink.name,
                description: drink.description,
                options: {
                    ...drink.options,
                    ...response.customizations
                }
            };

            // Add the customized drink to the menu so it can be ordered
            this.drinks.push(customizedDrink);

            return customizedDrink;

        } catch (error) {
            console.error('❌ Error parsing voice order response:', (error as Error).message);
            console.log('Response was:', responseText);
            throw error;
        }
    }

    /**
     * Validate LLM response for logical issues
     */
    private validateLLMResponse(response: any, drink: Drink, originalText: string): void {
        const issues: string[] = [];

        // Issue 1: Drink Hallucination - Check if drink name exists exactly
        if (!this.drinks.some(d => d.name.toLowerCase() === response.drinkName.toLowerCase())) {
            issues.push(`LLM hallucinated drink "${response.drinkName}" that doesn't exist in menu`);
        }

        // Issue 2: Invalid Customization Conflicts
        if (response.customizations) {
            const customizations = response.customizations;

            // Check for temperature conflicts
            if (customizations.temperature && customizations.temperature === 'iced' &&
                (customizations.temperature === 'hot' || customizations.temperature === 'extra hot')) {
                issues.push('LLM generated conflicting temperature customizations (iced and hot)');
            }

            // Check for logical conflicts
            if (customizations.temperature === 'iced' && customizations.temperature === 'extra hot') {
                issues.push('LLM generated conflicting temperature customizations (iced and extra hot)');
            }

            // Check for decaf conflicts with non-coffee drinks
            if (customizations.caffeine === 'decaf' &&
                !drink.name.toLowerCase().includes('coffee') &&
                !drink.name.toLowerCase().includes('espresso') &&
                !drink.name.toLowerCase().includes('americano')) {
                issues.push(`LLM requested decaf for non-coffee drink "${drink.name}"`);
            }
        }

        // Issue 3: Customization Value Mismatches
        if (response.customizations) {
            const customizations = response.customizations;

            // Check size values against available options
            if (customizations.size && drink.options.sizes) {
                const availableSizes = Array.isArray(drink.options.sizes) ? drink.options.sizes : Object.keys(drink.options.sizes);
                if (!availableSizes.some(size => size.toLowerCase() === customizations.size.toLowerCase())) {
                    issues.push(`LLM requested invalid size "${customizations.size}" for drink "${drink.name}". Available sizes: ${availableSizes.join(', ')}`);
                }
            }

            // Check milk values against available options
            if (customizations.milk && drink.options.milk) {
                const availableMilks = Array.isArray(drink.options.milk) ? drink.options.milk : Object.keys(drink.options.milk);
                if (!availableMilks.some(milk => milk.toLowerCase() === customizations.milk.toLowerCase())) {
                    issues.push(`LLM requested invalid milk "${customizations.milk}" for drink "${drink.name}". Available milks: ${availableMilks.join(', ')}`);
                }
            }

            // Check shot values against available options
            if (customizations.shots && drink.options.shots) {
                const availableShots = Array.isArray(drink.options.shots) ? drink.options.shots : Object.keys(drink.options.shots);
                if (!availableShots.some(shot => shot.toLowerCase() === customizations.shots.toLowerCase())) {
                    issues.push(`LLM requested invalid shot count "${customizations.shots}" for drink "${drink.name}". Available shots: ${availableShots.join(', ')}`);
                }
            }

            // Check temperature values against available options
            if (customizations.temperature && drink.options.temperature) {
                const availableTemps = Array.isArray(drink.options.temperature) ? drink.options.temperature : Object.keys(drink.options.temperature);
                if (!availableTemps.some(temp => temp.toLowerCase() === customizations.temperature.toLowerCase())) {
                    issues.push(`LLM requested invalid temperature "${customizations.temperature}" for drink "${drink.name}". Available temperatures: ${availableTemps.join(', ')}`);
                }
            }

            // Check flavor values against available options
            if (customizations.flavor && drink.options.flavors) {
                const availableFlavors = Array.isArray(drink.options.flavors) ? drink.options.flavors : Object.keys(drink.options.flavors);
                if (!availableFlavors.some(flavor => flavor.toLowerCase() === customizations.flavor.toLowerCase())) {
                    issues.push(`LLM requested invalid flavor "${customizations.flavor}" for drink "${drink.name}". Available flavors: ${availableFlavors.join(', ')}`);
                }
            }
        }

        // Throw error if any issues found
        if (issues.length > 0) {
            throw new Error(`LLM validation failed:\n- ${issues.join('\n- ')}`);
        }
    }

    /**
     * Get all orders with a specific status
     */
    getOrdersByStatus(status: OrderStatus): Order[] {
        return this.orders.filter(order => order.status === status);
    }

    /**
     * Get all orders
     */
    getAllOrders(): Order[] {
        return [...this.orders];
    }

    /**
     * Get all drinks in the menu
     */
    getMenu(): Drink[] {
        return [...this.drinks];
    }

    /**
     * Format order for display
     */
    private formatOrder(order: Order): string {
        const timeStr = order.orderedAt.toLocaleTimeString();
        const customizations = Object.keys(order.drink.options).length > 0
            ? ` (${Object.entries(order.drink.options).map(([key, value]) => `${key}: ${value}`).join(', ')})`
            : '';

        return `${timeStr} - ${order.drink.name}${customizations} [${order.status}]`;
    }

    /**
     * Display current orders by status
     */
    displayOrders(): void {
        console.log('\n📋 Current Orders');
        console.log('==================');

        const placedOrders = this.getOrdersByStatus(OrderStatus.PLACED);
        const servedOrders = this.getOrdersByStatus(OrderStatus.SERVED);
        const canceledOrders = this.getOrdersByStatus(OrderStatus.CANCELED);

        if (placedOrders.length > 0) {
            console.log('\n🟡 PLACED ORDERS:');
            placedOrders.forEach(order => console.log(`  ${this.formatOrder(order)}`));
        }

        if (servedOrders.length > 0) {
            console.log('\n🟢 SERVED ORDERS:');
            servedOrders.forEach(order => console.log(`  ${this.formatOrder(order)}`));
        }

        if (canceledOrders.length > 0) {
            console.log('\n🔴 CANCELED ORDERS:');
            canceledOrders.forEach(order => console.log(`  ${this.formatOrder(order)}`));
        }

        if (this.orders.length === 0) {
            console.log('No orders yet.');
        }
    }

    /**
     * Display the current menu
     */
    displayMenu(): void {
        console.log('\n☕ Available Drinks');
        console.log('==================');

        if (this.drinks.length === 0) {
            console.log('No drinks in menu yet.');
            return;
        }

        this.drinks.forEach(drink => {
            const description = drink.description ? ` - ${drink.description}` : '';
            const options = Object.keys(drink.options).length > 0
                ? `\n  Options: ${Object.entries(drink.options).map(([key, value]) => `${key}: ${value}`).join(', ')}`
                : '';
            console.log(`- ${drink.name}${description}${options}`);
        });
    }
}
