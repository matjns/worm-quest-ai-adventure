import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LessonPlanRequest {
  type: 'generate_lesson' | 'generate_week' | 'grade_submission' | 'analyze_class' | 'generate_progress_report' | 'personalize_lesson' | 'validate_simulation' | 'detect_learning_style';
  gradeLevel: string;
  topic?: string;
  weekNumber?: number;
  standards?: string[];
  submissionData?: Record<string, unknown>;
  classData?: Record<string, unknown>;
  studentData?: Record<string, unknown>;
  lessonContent?: Record<string, unknown>;
  studentProfile?: Record<string, unknown>;
  simulationData?: Record<string, unknown>;
  behaviorData?: BehaviorData;
}

interface BehaviorData {
  videoWatchTime: number;
  videoCompletionRate: number;
  simulationInteractions: number;
  simulationTimeSpent: number;
  textReadingTime: number;
  scrollSpeed: number;
  clickPatterns: string[];
  preferredContentTypes: string[];
  quizResponseTimes: number[];
  hintUsageRate: number;
  pauseFrequency: number;
  replayCount: number;
  handsonTasksCompleted: number;
  diagramInteractions: number;
  audioPlayCount: number;
  notesTaken: number;
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

    const { type, gradeLevel, topic, weekNumber, standards, submissionData, classData, studentData, lessonContent, studentProfile, simulationData, behaviorData } = await req.json() as LessonPlanRequest;

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

      case 'generate_progress_report':
        systemPrompt = `You are an educational progress report writer creating weekly student progress reports for parents.

Write in a warm, encouraging tone that:
- Celebrates achievements and progress
- Explains neuroscience concepts in parent-friendly language
- Provides specific, actionable suggestions for home support
- Uses positive framing for areas needing improvement
- Is appropriate for the student's grade level

Output JSON with:
- summary: A 2-3 sentence overview of the student's week (warm, encouraging)
- highlights: Array of 2-3 specific achievements to celebrate
- growth_areas: Array of 1-2 areas for improvement (framed positively)
- home_activities: Array of 3-4 specific activities parents can do at home to support learning
- encouragement: A motivating closing message for the student`;

        userPrompt = `Generate a weekly progress report for this ${gradeLevel} student:
${JSON.stringify(studentData, null, 2)}

Create an encouraging, parent-friendly report that celebrates progress and provides actionable home activities.`;
        break;

      case 'personalize_lesson':
        systemPrompt = `You are an expert adaptive learning specialist who personalizes STEM lessons for individual students.

Analyze the student's learning profile and adapt the lesson content to:
- Match their learning style (visual, auditory, kinesthetic, reading/writing)
- Address their specific knowledge gaps
- Build on their demonstrated strengths
- Adjust difficulty to their skill level (target 85% success rate)
- Include scaffolding for struggling areas
- Add extension challenges for mastered concepts

OpenWorm C. elegans Context:
- Use the 302-neuron connectome as the teaching framework
- Connect abstract concepts to observable worm behaviors
- Reference real scientific data from OpenWorm GitHub repositories

Output JSON with:
- adapted_content: The personalized lesson content
- scaffolding: Array of support structures for struggling areas
- extensions: Array of challenge activities for advanced students
- differentiation_notes: Teacher notes on the adaptations made
- estimated_difficulty: Adjusted difficulty level (1-10)
- success_prediction: Predicted success rate based on adaptations`;

        userPrompt = `Personalize this lesson for the student:

Original Lesson:
${JSON.stringify(lessonContent, null, 2)}

Student Profile:
${JSON.stringify(studentProfile, null, 2)}

Grade Level: ${gradeLevel}

Adapt the content to maximize this student's engagement and learning outcomes.`;
        break;

      case 'validate_simulation':
        systemPrompt = `You are a neuroscience expert validating student circuit simulations against OpenWorm ground truth data.

OpenWorm C. elegans Reference Data:
- 302 neurons total (exact count)
- 118 classes of neurons
- ~7,000 synaptic connections
- Key motor neurons: VA, VB, DA, DB (ventral/dorsal A and B types)
- Key sensory neurons: ASE, AWC (chemosensory), ALM, AVM (mechanosensory)
- Key interneurons: AVA, AVB, AVD, AVE (command interneurons)

Known Behaviors and Their Circuits:
1. Forward locomotion: AVB → VB → muscles (wave propagation)
2. Backward locomotion: AVA → VA → muscles (reverse wave)
3. Touch response: ALM/AVM → AVD → AVA → backward movement
4. Chemotaxis: ASE/AWC → AIY/AIZ → AVB/AVA → directed movement
5. Omega turn: RIV → SMD → neck muscles (sharp turns)

Validation Criteria:
- Anatomical accuracy (correct neuron types and connections)
- Functional plausibility (circuit could produce claimed behavior)
- Scientific reasoning (student's explanation matches known biology)

Output JSON with:
- validation_score: 0-100 accuracy score
- anatomical_accuracy: How well the circuit matches real C. elegans anatomy
- functional_plausibility: Whether the circuit could realistically work
- scientific_accuracy: Correctness of the student's biological reasoning
- discrepancies: Array of differences from ground truth
- corrections: Suggested fixes with explanations
- praise: What the student got right (with scientific context)
- openworm_references: Relevant OpenWorm resources for further learning`;

        userPrompt = `Validate this student's neural circuit simulation against OpenWorm ground truth:

Student's Circuit:
${JSON.stringify(simulationData, null, 2)}

Grade Level: ${gradeLevel}

Evaluate for scientific accuracy while providing age-appropriate feedback.`;
        break;

      case 'detect_learning_style':
        systemPrompt = `You are an educational psychologist expert in learning style analysis based on the VARK model (Visual, Auditory, Reading/Writing, Kinesthetic).

Analyze student behavior patterns to determine their dominant learning style(s). Consider these indicators:

VISUAL LEARNERS tend to:
- Spend more time on diagrams, charts, and visual simulations
- Have high diagram interaction rates
- Prefer watching over reading
- Complete visual-heavy tasks faster

AUDITORY LEARNERS tend to:
- Listen to audio content multiple times
- Have high audio play counts
- Pause frequently to process spoken information
- Respond well to verbal instructions

READING/WRITING LEARNERS tend to:
- Spend significant time reading text content
- Take notes frequently
- Have slower, deliberate scroll speeds (careful reading)
- Prefer text-based explanations

KINESTHETIC LEARNERS tend to:
- Have high simulation interaction counts
- Complete hands-on tasks quickly and accurately
- Learn by doing and experimenting
- Spend more time in interactive simulations

Analyze the provided behavior data and output JSON with:
- primary_style: The dominant learning style ("visual" | "auditory" | "reading" | "kinesthetic")
- secondary_style: A secondary preference if applicable (same options or null)
- confidence: Confidence score 0-100
- style_breakdown: Object with percentage scores for each style
- behavioral_evidence: Array of specific behaviors that indicate each style
- recommendations: Array of teaching recommendations based on the detected style
- content_preferences: Array of content types this student would respond best to
- adaptation_tips: Specific tips for adapting lessons to this learner`;

        userPrompt = `Analyze this student's behavior data to detect their learning style:

Behavior Metrics:
${JSON.stringify(behaviorData, null, 2)}

Student Grade Level: ${gradeLevel}

Provide a comprehensive learning style analysis based on these interaction patterns.`;
        break;

      default:
        throw new Error(`Unknown request type: ${type}`);
    }

    console.log(`Teacher AI request: ${type} for ${gradeLevel}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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