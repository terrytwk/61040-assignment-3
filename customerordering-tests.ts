/**
 * CustomerOrdering Test Cases
 * 
 * Demonstrates both manual ordering and AI-assisted voice ordering
 */

import { CustomerOrdering, OrderStatus } from './customerorder';
import { GeminiLLM, Config } from './gemini-llm';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

/**
 * Test case 1: Basic Voice Ordering
 * Demonstrates simple voice order processing and order management
 */
export async function testBasicVoiceOrdering(): Promise<void> {
    console.log('\n🧪 TEST CASE 1: Basic Voice Ordering');
    console.log('====================================');

    const ordering = new CustomerOrdering();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    // Add basic drinks to menu
    console.log('📝 Adding drinks to menu...');
    const coffee = ordering.addDrink('Coffee', 'Freshly brewed coffee', {
        sizes: ['small', 'medium', 'large'],
        milk: ['whole', 'skim', 'oat', 'almond']
    });
    const latte = ordering.addDrink('Latte', 'Espresso with steamed milk', {
        sizes: ['small', 'medium', 'large'],
        milk: ['whole', 'skim', 'oat', 'almond']
    });
    const cappuccino = ordering.addDrink('Cappuccino', 'Espresso with foamed milk', {
        sizes: ['small', 'medium', 'large'],
        milk: ['whole', 'skim', 'oat', 'almond']
    });

    // Display menu
    ordering.displayMenu();

    // Place a simple voice order
    console.log('\n🎤 Processing voice order...');
    const order1 = await ordering.placeVoiceOrder("I'd like a large coffee with oat milk", llm);

    // Display orders
    ordering.displayOrders();

    // Mark order as served
    console.log('\n✅ Marking order as served...');
    ordering.markServed(order1);

    // Display final status
    ordering.displayOrders();
}

/**
 * Test case 2: Complex Customization Order
 * Demonstrates handling complex orders with multiple customizations
 */
export async function testComplexCustomizationOrder(): Promise<void> {
    console.log('\n🧪 TEST CASE 2: Complex Customization Order');
    console.log('===========================================');

    const ordering = new CustomerOrdering();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    // Add comprehensive drinks to menu
    console.log('📝 Adding comprehensive drinks to menu...');
    ordering.addDrink('Caramel Macchiato', 'Espresso with vanilla syrup, steamed milk, and caramel drizzle', {
        sizes: ['tall', 'grande', 'venti'],
        milk: ['whole', 'skim', 'oat', 'almond', 'coconut'],
        shots: ['single', 'double', 'triple'],
        temperature: ['hot', 'iced'],
        flavors: ['vanilla', 'caramel', 'hazelnut']
    });

    ordering.addDrink('Espresso', 'Concentrated coffee shot', {
        sizes: ['single', 'double', 'triple'],
        temperature: ['hot', 'iced']
    });

    ordering.addDrink('Green Tea', 'Refreshing green tea', {
        sizes: ['small', 'medium', 'large'],
        temperature: ['hot', 'iced'],
        sweetness: ['no sugar', 'light', 'medium', 'extra']
    });

    // Display menu
    ordering.displayMenu();

    // Place a complex voice order
    console.log('\n🎤 Processing complex voice order...');
    const order1 = await ordering.placeVoiceOrder("Give me a venti caramel macchiato, hot, with almond milk and a double shot", llm);

    // Place another complex order
    console.log('\n🎤 Processing another complex order...');
    const order2 = await ordering.placeVoiceOrder("I'll take a large iced green tea with light sweetness", llm);

    // Display orders
    ordering.displayOrders();

    // Serve both orders
    console.log('\n✅ Serving orders...');
    ordering.markServed(order1);
    ordering.markServed(order2);

    // Display final status
    ordering.displayOrders();
}

/**
 * Test case 3: Order Management Workflow
 * Demonstrates full order lifecycle with multiple orders and cancellations
 */
export async function testOrderManagementWorkflow(): Promise<void> {
    console.log('\n🧪 TEST CASE 3: Order Management Workflow');
    console.log('==========================================');

    const ordering = new CustomerOrdering();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    // Add comprehensive menu
    console.log('📝 Adding comprehensive menu...');
    ordering.addDrink('Americano', 'Espresso with hot water', {
        sizes: ['small', 'medium', 'large'],
        milk: ['none', 'whole', 'skim', 'oat', 'almond'],
        shots: ['single', 'double', 'triple']
    });

    ordering.addDrink('Mocha', 'Espresso with chocolate and steamed milk', {
        sizes: ['small', 'medium', 'large'],
        milk: ['whole', 'skim', 'oat', 'almond'],
        shots: ['single', 'double', 'triple'],
        temperature: ['hot', 'iced']
    });

    ordering.addDrink('Frappuccino', 'Blended coffee drink', {
        sizes: ['tall', 'grande', 'venti'],
        flavors: ['vanilla', 'caramel', 'mocha', 'strawberry']
    });

    // Display menu
    ordering.displayMenu();

    // Place multiple voice orders
    console.log('\n🎤 Processing multiple voice orders...');

    const order1 = await ordering.placeVoiceOrder("I'd like a medium americano with oat milk", llm);
    const order2 = await ordering.placeVoiceOrder("Can I get a large iced mocha with almond milk and double shot?", llm);
    const order3 = await ordering.placeVoiceOrder("I'll take a grande vanilla frappuccino", llm);

    // Display current orders
    console.log('\n📋 Current orders:');
    ordering.displayOrders();

    // Customer changes mind and cancels one order
    console.log('\n❌ Customer cancels order...');
    ordering.cancelOrder(order2);

    // Display orders after cancellation
    console.log('\n📋 Orders after cancellation:');
    ordering.displayOrders();

    // Serve remaining orders
    console.log('\n✅ Serving remaining orders...');
    ordering.markServed(order1);
    ordering.markServed(order3);

    // Display final status
    console.log('\n📋 Final order status:');
    ordering.displayOrders();
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
    console.log('🎓 CustomerOrdering Test Suite');
    console.log('=============================\n');

    try {
        // Run basic voice ordering test
        await testBasicVoiceOrdering();

        // Run complex customization test
        await testComplexCustomizationOrder();

        // Run order management workflow test
        await testOrderManagementWorkflow();

        console.log('\n🎉 All test cases completed successfully!');

    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    main();
}
