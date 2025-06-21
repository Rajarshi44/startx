// Test script for Tavus API integration
// Run with: node scripts/test-tavus.js

const fetch = require('node-fetch');

const TAVUS_API_KEY = process.env.TAVUS_API_KEY || 'your_api_key_here';
const BASE_URL = 'https://tavusapi.com';

async function testTavusAPI() {
  console.log('🧪 Testing Tavus API Integration...\n');

  // Test 1: Check API key
  if (!TAVUS_API_KEY || TAVUS_API_KEY === 'your_api_key_here') {
    console.log('❌ TAVUS_API_KEY not set. Please set the environment variable.');
    return;
  }

  console.log('✅ API Key configured');

  // Test 2: Create a test persona
  console.log('\n📝 Testing persona creation...');
  try {
    const personaResponse = await fetch(`${BASE_URL}/v2/personas`, {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        persona_name: 'Test Interviewer - Sarah',
        system_prompt: 'You are Sarah, an experienced HR professional conducting a test interview.',
        context: 'This is a test interview for the Software Engineer position.',
      }),
    });

    if (personaResponse.ok) {
      const persona = await personaResponse.json();
      console.log('✅ Persona created successfully');
      console.log(`   Persona ID: ${persona.persona_id}`);
      
      // Test 3: Create a test conversation
      console.log('\n💬 Testing conversation creation...');
      const conversationResponse = await fetch(`${BASE_URL}/v2/conversations`, {
        method: 'POST',
        headers: {
          'x-api-key': TAVUS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona_id: persona.persona_id,
          conversation_name: 'Test Interview Session',
          properties: {
            max_call_duration: 1800, // 30 minutes
            enable_recording: true,
            enable_transcription: true,
          },
        }),
      });

      if (conversationResponse.ok) {
        const conversation = await conversationResponse.json();
        console.log('✅ Conversation created successfully');
        console.log(`   Conversation ID: ${conversation.conversation_id}`);
        console.log(`   Conversation URL: ${conversation.conversation_url}`);
        
        // Test 4: End the conversation
        console.log('\n🔚 Testing conversation ending...');
        const endResponse = await fetch(`${BASE_URL}/v2/conversations/${conversation.conversation_id}/end`, {
          method: 'POST',
          headers: {
            'x-api-key': TAVUS_API_KEY,
          },
        });

        if (endResponse.ok) {
          console.log('✅ Conversation ended successfully');
        } else {
          console.log('⚠️  Conversation end failed (this might be expected for test conversations)');
        }
      } else {
        const error = await conversationResponse.json();
        console.log('❌ Conversation creation failed:', error);
      }
    } else {
      const error = await personaResponse.json();
      console.log('❌ Persona creation failed:', error);
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }

  console.log('\n🎉 Tavus API test completed!');
}

// Run the test
testTavusAPI().catch(console.error); 