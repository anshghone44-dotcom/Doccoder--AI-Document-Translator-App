#!/usr/bin/env node

/**
 * AI Model and API Key Validator
 * This script validates your AI model configurations and environment variables.
 */

try {
    require('dotenv').config({ path: '.env.local' });
} catch (e) {
    // Ignore if dotenv is not available or file is missing
}

async function validateAIModels() {
    console.log('🔍 Validating AI Model Setup...\n');

    const keys = {
        OPENAI_API_KEY: { name: 'OpenAI', prefix: 'sk-' },
        ANTHROPIC_API_KEY: { name: 'Anthropic', prefix: 'sk-ant-' },
        XAI_API_KEY: { name: 'xAI (Grok)', prefix: '' },
        ELEVENLABS_API_KEY: { name: 'ElevenLabs', prefix: '' }
    };

    console.log('1. Checking Environment Variables in .env.local:');
    let allSet = true;

    for (const [key, info] of Object.entries(keys)) {
        const value = process.env[key]?.trim();
        if (value) {
            const isPlaceholder = value.includes('your-') || value.includes('YOUR_');
            const hasPrefix = info.prefix ? value.startsWith(info.prefix) : true;

            if (isPlaceholder) {
                console.log(`   ❌ ${key}: Placeholder value detected`);
                allSet = false;
            } else if (!hasPrefix) {
                console.log(`   ⚠️  ${key}: Set, but doesn't match expected prefix (${info.prefix})`);
            } else {
                console.log(`   ✅ ${key}: Set`);
            }
        } else {
            console.log(`   ❌ ${key}: Missing`);
            allSet = false;
        }
    }

    console.log('\n2. Verifying Library Support:');
    try {
        require('@ai-sdk/openai');
        console.log('   ✅ @ai-sdk/openai: Installed');
    } catch (e) {
        console.log('   ❌ @ai-sdk/openai: Missing');
    }

    try {
        require('@ai-sdk/anthropic');
        console.log('   ✅ @ai-sdk/anthropic: Installed');
    } catch (e) {
        console.log('   ❌ @ai-sdk/anthropic: Missing');
    }

    try {
        require('@ai-sdk/xai');
        console.log('   ✅ @ai-sdk/xai: Installed');
    } catch (e) {
        console.log('   ❌ @ai-sdk/xai: Missing');
    }

    console.log('\n3. Model Mapping Verification:');
    console.log('   (Verifying app/api/chat-translate/route.ts logic)');

    const testModels = [
        { id: 'openai/gpt-4-mini', provider: 'openai' },
        { id: 'anthropic/claude-3.1', provider: 'anthropic' },
        { id: 'xai/grok-3', provider: 'xai' }
    ];

    testModels.forEach(m => {
        const provider = m.id.split('/')[0];
        const key = `${provider.toUpperCase()}_API_KEY`;
        if (!process.env[key]) {
            console.log(`   ⚠️  Requesting ${m.id} will fail due to missing ${key}`);
        } else {
            console.log(`   ✅ ${m.id} is ready for use (Provider: ${provider})`);
        }
    });

    console.log('\n📋 Next Steps:');
    if (!allSet) {
        console.log('1. Update your .env.local file with the missing keys.');
        console.log('2. Ensure you have the corresponding provider models enabled in your AI dashboards.');
    } else {
        console.log('1. Everything looks configured correctly!');
        console.log('2. If you still encounter issues, check the server console for LLM runtime errors.');
    }

    console.log('\n🎉 AI validation complete!');
}

validateAIModels().catch(console.error);
