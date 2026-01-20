import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonPlanRequest {
  type: 'generate_lesson' | 'generate_week' | 'grade_submission' | 'analyze_class';
  gradeLevel: string;
  topic?: string;
  weekNumber?: number;
  standards?: string[];
  submissionData?: Record<string, unknown>;
  classData?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { type, gradeLevel, topic, weekNumber, standards, submissionData, classData } = await req.json() as LessonPlanRequest;

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'generate_lesson':
        systemPrompt = `You are an expert curriculum designer specializing in NGSS-aligned STEM education using the OpenWorm C. elegans model organism. 
        
Create engaging, age-appropriate lesson plans that:
- Align with Next Generation Science Standards (NGSS)
- Use C. elegans and neural circuits as a concrete example for abstract AI/neuroscience concepts
- Include hands-on simulation activities using the NeuroQuest platform
- Support differentiated instruction for diverse learners
- Include formative assessment checkpoints

Grade level context for ${gradeLevel}:
- Pre-K/K: Focus on observation, pattern recognition, simple cause-effect
- Elementary (K-5): Scientific inquiry, basic neural concepts, data collection
- Middle School: Neural network basics, data analysis, coding introduction
- High School: AI/ML concepts, advanced simulations, research skills

Output structured JSON with: title, objectives, standards, materials, warmUp, mainActivity, simulation_activity, assessment, extension, duration_minutes`;

        userPrompt = `Create a detailed lesson plan for grade level "${gradeLevel}" about "${topic || 'Introduction to Neural Circuits'}".
${standards && standards.length > 0 ? `Align with these standards: ${standards.join(', ')}` : ''}

The lesson should use the NeuroQuest platform's C. elegans neural circuit simulator.`;
        break;

      case 'generate_week':
        systemPrompt = `You are a curriculum planning expert creating a 5-day unit using OpenWorm's C. elegans for teaching AI and neuroscience.

Create a cohesive weekly unit that:
- Builds progressively from Monday to Friday
- Each day has a clear learning objective
- Includes daily discussion prompts for teachers
- Uses NeuroQuest simulations throughout
- Culminates in a Friday project/assessment

Output as JSON array with 5 days, each containing: day, title, objective, discussion_prompts[], key_activities[], simulation_task, homework`;

        userPrompt = `Create a 5-day curriculum unit for week ${weekNumber || 1} at grade level "${gradeLevel}" focused on "${topic || 'Neural Circuits and AI'}".`;
        break;

      case 'grade_submission':
        systemPrompt = `You are an AI grading assistant for neuroscience education. Evaluate student work based on:
- Understanding of neural circuit concepts
- Accuracy of simulation predictions
- Critical thinking and scientific reasoning
- Proper use of terminology for grade level

Provide constructive, encouraging feedback appropriate for the age group. Be specific about what was done well and what could improve.

Output JSON with: score (0-100), strengths[], improvements[], detailed_feedback, encouragement`;

        userPrompt = `Grade this ${gradeLevel} student submission:
${JSON.stringify(submissionData, null, 2)}

Evaluate understanding of neural concepts and simulation accuracy.`;
        break;

      case 'analyze_class':
        systemPrompt = `You are a learning analytics expert analyzing classroom performance data for neuroscience education.

Identify:
- Class-wide strengths and struggles
- Concepts that need re-teaching
- Recommendations for differentiation
- Students who may need extra support or enrichment
- Trends over time

Output JSON with: class_summary, common_struggles[], mastered_concepts[], recommendations[], students_needing_attention[], suggested_activities[]`;

        userPrompt = `Analyze this classroom data for ${gradeLevel}:
${JSON.stringify(classData, null, 2)}

Provide actionable insights for the teacher.`;
        break;

      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    console.log(`Teacher AI request: ${type} for ${gradeLevel}`);

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits depleted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to parse as JSON, otherwise return as text
    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonStr.trim());
    } catch {
      result = { content, raw: true };
    }

    console.log(`Teacher AI ${type} completed successfully`);

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Teacher AI error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});