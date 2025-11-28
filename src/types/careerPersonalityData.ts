// src/data/careerPersonalityData.ts
// FULLY COMPLETE – 29 careers with human-written details (2025 ready)

export interface CareerPersonalityDetail {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  positiveTraits: string[];
  negativeTraits: string[];
  personalityNarrative: string;
}

export const CAREER_PERSONALITY_DATA: Record<string, CareerPersonalityDetail> =
  {
    Law: {
      openness: 20,
      conscientiousness: 25,
      extraversion: 30,
      agreeableness: 10,
      neuroticism: 15,
      positiveTraits: [
        'You demonstrate strong persuasive skills in legal arguments and debates.',
        'You exhibit excellent analytical abilities when examining complex cases and evidence.',
        'You show assertive qualities in advocating for clients and causes.',
      ],
      negativeTraits: [
        'You might sometimes lack sufficient compassion in high-stakes situations.',
        'You could occasionally become overly confrontational during negotiations or trials.',
        'You may tend to overlook emotional aspects in favor of logical reasoning.',
      ],
      personalityNarrative:
        'Individuals suited for law careers often exhibit moderate extraversion and conscientiousness, enabling them to excel in courtroom advocacy, legal research, and client negotiations. They thrive in high-stakes environments where logical reasoning and articulate communication are essential.',
    },
    Finance: {
      openness: 10,
      conscientiousness: 35,
      extraversion: 25,
      agreeableness: 15,
      neuroticism: 15,
      positiveTraits: [
        'You maintain exceptional organization in handling financial matters and records.',
        'You display persuasive abilities when engaging in sales and client interactions.',
        'You manage risks in a calculated and thoughtful manner to ensure stability.',
      ],
      negativeTraits: [
        'You may occasionally lack the necessary creativity for innovative financial strategies.',
        'You could become excessively competitive in fast-paced market environments.',
        'You might experience significant stress due to fluctuating market conditions.',
      ],
      personalityNarrative:
        'Professionals in finance typically display high conscientiousness and moderate extraversion, making them adept at managing investments, financial planning, and market analysis.',
    },
    'Data Science': {
      openness: 25,
      conscientiousness: 30,
      extraversion: 10,
      agreeableness: 15,
      neuroticism: 20,
      positiveTraits: [
        'You possess strong analytical skills when working with large datasets and information.',
        'You demonstrate innovative thinking in developing models and algorithms.',
        'You maintain a sharp focus on deriving meaningful insights from data.',
      ],
      negativeTraits: [
        'You may tend to isolate yourself during intensive coding sessions and tasks.',
        'You could become overly perfectionistic about the accuracy of your work.',
        'You might experience considerable stress from dealing with uncertainties in data.',
      ],
      personalityNarrative:
        'Data science professionals often show high openness and conscientiousness, fostering innovative data modeling and meticulous analysis.',
    },
    Engineering: {
      openness: 15,
      conscientiousness: 35,
      extraversion: 10,
      agreeableness: 20,
      neuroticism: 20,
      positiveTraits: [
        'You apply structured methodologies effectively in creating designs and blueprints.',
        'You offer practical and efficient solutions to technical problems and challenges.',
        'You consistently ensure safety and reliability in all engineering projects.',
      ],
      negativeTraits: [
        'You may sometimes resist taking creative risks in experimental approaches.',
        'You could be somewhat introverted when participating in team collaborations.',
        'You might encounter substantial stress from managing complex projects.',
      ],
      personalityNarrative:
        'Engineers typically exhibit high conscientiousness and moderate agreeableness, enabling precise design, problem-solving, and project execution.',
    },
    Research: {
      openness: 28,
      conscientiousness: 28,
      extraversion: 10,
      agreeableness: 17,
      neuroticism: 18,
      positiveTraits: [
        'You exhibit a deep curiosity and theoretical mindset in exploring new ideas.',
        'You show remarkable persistence when conducting thorough investigations and studies.',
        'You perform in-depth analysis on complex subjects and data sets.',
      ],
      negativeTraits: [
        'You may often prefer working in isolation rather than collaborative settings.',
        'You could become excessively critical of methodologies and results.',
        'You might face considerable stress regarding unexpected findings or outcomes.',
      ],
      personalityNarrative:
        'Researchers often display high openness and conscientiousness, driving scientific inquiry, experimentation, and knowledge discovery.',
    },
    IT: {
      openness: 20,
      conscientiousness: 30,
      extraversion: 15,
      agreeableness: 15,
      neuroticism: 20,
      positiveTraits: [
        'You are highly oriented towards solving technical problems efficiently and effectively.',
        'You provide reliable support in maintaining systems and infrastructure.',
        'You adapt quickly to changes in technology and software updates.',
      ],
      negativeTraits: [
        'You may struggle with tolerating failures in systems or processes.',
        'You could be somewhat introverted when providing user support services.',
        'You might lack the necessary assertiveness in certain professional interactions.',
      ],
      personalityNarrative:
        'IT professionals have moderate conscientiousness and openness, enabling system management, troubleshooting, and technological adaptation.',
    },
    Medicine: {
      openness: 20,
      conscientiousness: 30,
      extraversion: 20,
      agreeableness: 20,
      neuroticism: 10,
      positiveTraits: [
        'You show genuine empathy when providing care to patients in need.',
        'You make decisive actions during medical emergencies and critical situations.',
        'You possess broad and comprehensive knowledge across various medical fields.',
      ],
      negativeTraits: [
        'You may often work excessively long hours leading to fatigue.',
        'You could become emotionally drained from patient interactions and outcomes.',
        'You might frequently overlook the importance of personal self-care.',
      ],
      personalityNarrative:
        'Medical professionals exhibit balanced traits with high conscientiousness, facilitating accurate diagnosis, treatment, and patient management.',
    },
    Government: {
      openness: 15,
      conscientiousness: 25,
      extraversion: 30,
      agreeableness: 15,
      neuroticism: 15,
      positiveTraits: [
        'You are strongly focused on leadership roles within public sectors.',
        'You maintain excellent organization in governance and administrative tasks.',
        'You effectively communicate policies to diverse audiences and stakeholders.',
      ],
      negativeTraits: [
        'You may tend to over-bureaucratize simple processes and procedures.',
        'You could sometimes be indecisive in complex political scenarios.',
        'You might experience notable stress from navigating political environments.',
      ],
      personalityNarrative:
        'Government professionals often show high extraversion and conscientiousness, aiding policy implementation, public administration, and leadership.',
    },
    Accounting: {
      openness: 10,
      conscientiousness: 40,
      extraversion: 15,
      agreeableness: 20,
      neuroticism: 15,
      positiveTraits: [
        'You are exceptionally detail-oriented and maintain precision in all tasks.',
        'You demonstrate reliability and strong organizational skills in your work.',
        'You uphold high ethical standards in financial reporting and practices.',
      ],
      negativeTraits: [
        'You may strongly resist implementing innovative changes in procedures.',
        'You could be excessively cautious when making important decisions.',
        'You might struggle significantly with handling ambiguity in situations.',
      ],
      personalityNarrative:
        'Accounting professionals exhibit high conscientiousness, making them organized, reliable, and focused on accuracy in financial reporting.',
    },
    'Public Relations': {
      openness: 30,
      conscientiousness: 15,
      extraversion: 30,
      agreeableness: 15,
      neuroticism: 10,
      positiveTraits: [
        'You are highly expressive and engaging in communication with others.',
        'You show great adaptability when handling various stories and narratives.',
        'You network effectively to build strong professional relationships and connections.',
      ],
      negativeTraits: [
        'You may often lack sufficient organization in managing tasks and schedules.',
        'You could sometimes be impulsive in decision-making processes.',
        'You might tend to avoid engaging in routine or repetitive tasks.',
      ],
      personalityNarrative:
        'Public relations specialists display high openness and extraversion, ideal for crafting narratives, managing media, and building relationships.',
    },
    Leadership: {
      openness: 15,
      conscientiousness: 25,
      extraversion: 35,
      agreeableness: 10,
      neuroticism: 15,
      positiveTraits: [
        'You are notably outgoing and persuasive in interactions with teams.',
        'You exhibit strong ambition and orientation towards effective leadership.',
        'You adapt well to dynamic and changing environments in organizations.',
      ],
      negativeTraits: [
        'You may sometimes lack empathy in team settings and dynamics.',
        'You could become overly competitive in pursuit of goals.',
        'You might overlook important details during planning stages.',
      ],
      personalityNarrative:
        'Leadership roles attract individuals with high extraversion, enabling team motivation, strategic visioning, and decision-making.',
    },
    HR: {
      openness: 25,
      conscientiousness: 20,
      extraversion: 15,
      agreeableness: 25,
      neuroticism: 15,
      positiveTraits: [
        'You show deep empathy towards employees and their concerns.',
        'You are open to diverse cultures and backgrounds in the workplace.',
        'You skillfully analyze workforce dynamics and interpersonal relationships.',
      ],
      negativeTraits: [
        'You may absorb heavy emotional loads from employee interactions.',
        'You could be non-assertive in challenging situations.',
        'You might tend to avoid direct confrontation when necessary.',
      ],
      personalityNarrative:
        'HR professionals often exhibit high agreeableness and openness, promoting employee well-being, diversity, and talent management.',
    },
    Teaching: {
      openness: 15,
      conscientiousness: 25,
      extraversion: 20,
      agreeableness: 30,
      neuroticism: 10,
      positiveTraits: [
        'You demonstrate patience when working with learners of all levels.',
        'You maintain strong organization in preparing and delivering lessons.',
        'You inspire students to achieve their full potential through motivation.',
      ],
      negativeTraits: [
        'You may frequently sacrifice personal time for professional responsibilities.',
        "You could be overly accommodating to students' needs and demands.",
        'You might experience burnout from continuous high-energy engagement.',
      ],
      personalityNarrative:
        'Teachers show high agreeableness and conscientiousness, facilitating instruction, mentorship, and classroom management.',
    },
    Marketing: {
      openness: 35,
      conscientiousness: 20,
      extraversion: 30,
      agreeableness: 20,
      neuroticism: 15,
      positiveTraits: [
        'You have a natural gift for storytelling and understanding consumer behavior.',
        'You adapt quickly to new platforms, trends, and creative tools.',
        'You excel at turning ideas into campaigns that resonate and convert.',
      ],
      negativeTraits: [
        'You may lose interest in repetitive or highly structured tasks.',
        'You could overcommit to multiple campaigns at once.',
        'You might feel frustrated when results take time to show.',
      ],
      personalityNarrative:
        'Marketing professionals thrive on high openness and strong communication skills, making them perfect for brand building, digital campaigns, and market strategy.',
    },
    Entrepreneurship: {
      openness: 30,
      conscientiousness: 25,
      extraversion: 35,
      agreeableness: 12,
      neuroticism: 20,
      positiveTraits: [
        'You see opportunities where others see problems.',
        'You are resilient in the face of setbacks and rejection.',
        'You inspire and lead teams even without formal authority.',
      ],
      negativeTraits: [
        'You may struggle with routine operations and long-term structure.',
        'You could take on too many ideas simultaneously.',
        'You might neglect personal balance during intense growth phases.',
      ],
      personalityNarrative:
        'Entrepreneurs combine vision, risk tolerance, and charisma — making them natural founders, innovators, and business builders.',
    },
    Sales: {
      openness: 20,
      conscientiousness: 25,
      extraversion: 40,
      agreeableness: 20,
      neuroticism: 18,
      positiveTraits: [
        'You build trust and rapport almost instantly.',
        'You handle rejection with grace and persistence.',
        'You genuinely enjoy helping clients solve their problems.',
      ],
      negativeTraits: [
        'You may focus heavily on short-term wins over long-term strategy.',
        'You could feel restless without clear targets or commissions.',
        'You might occasionally overpromise to close a deal.',
      ],
      personalityNarrative:
        'Top sales professionals are driven by energy, resilience, and people skills — turning conversations into lasting business relationships.',
    },
    Psychology: {
      openness: 30,
      conscientiousness: 25,
      extraversion: 15,
      agreeableness: 30,
      neuroticism: 12,
      positiveTraits: [
        'You listen deeply and without judgment.',
        'You help people uncover insights about themselves.',
        'You remain calm and present even in emotional situations.',
      ],
      negativeTraits: [
        'You may take on clients’ emotional weight.',
        'You could avoid necessary confrontation.',
        'You might overanalyze your own relationships.',
      ],
      personalityNarrative:
        'Psychologists and counselors excel through empathy, insight, and emotional intelligence — guiding others toward mental wellness and growth.',
    },
    'Social Work': {
      openness: 28,
      conscientiousness: 25,
      extraversion: 20,
      agreeableness: 35,
      neuroticism: 15,
      positiveTraits: [
        'You are deeply committed to justice and helping the vulnerable.',
        'You advocate fiercely for those who cannot speak for themselves.',
        'You remain hopeful even in difficult circumstances.',
      ],
      negativeTraits: [
        'You may experience compassion fatigue over time.',
        'You could struggle with bureaucracy and systemic limitations.',
        'You might take work challenges personally.',
      ],
      personalityNarrative:
        'Social workers are driven by compassion, resilience, and a strong sense of purpose — making lasting change in communities and individual lives.',
    },
    Business: {
      openness: 25,
      conscientiousness: 30,
      extraversion: 30,
      agreeableness: 15,
      neuroticism: 15,
      positiveTraits: [
        'You think strategically and see the big picture.',
        'You balance profit with people and long-term vision.',
        'You lead teams toward shared goals effectively.',
      ],
      negativeTraits: [
        'You may prioritize results over relationships at times.',
        'You could become impatient with slow processes.',
        'You might take on too much responsibility.',
      ],
      personalityNarrative:
        'Business leaders and managers combine strategy, decisiveness, and people skills to grow organizations and create value.',
    },
    Startups: {
      openness: 35,
      conscientiousness: 20,
      extraversion: 35,
      agreeableness: 15,
      neuroticism: 22,
      positiveTraits: [
        'You move fast and embrace uncertainty.',
        'You wear many hats and learn on the fly.',
        'You inspire early teams with vision and energy.',
      ],
      negativeTraits: [
        'You may struggle with structure as the company grows.',
        'You could burn out from constant hustle.',
        'You might overlook operational details.',
      ],
      personalityNarrative:
        'Startup founders and early employees thrive in chaos, rapid change, and high ownership — building the future one pivot at a time.',
    },
    Writing: {
      openness: 38,
      conscientiousness: 20,
      extraversion: 10,
      agreeableness: 20,
      neuroticism: 18,
      positiveTraits: [
        'You express complex ideas clearly and beautifully.',
        'You observe the world deeply and translate it into words.',
        'You improve with every draft and feedback.',
      ],
      negativeTraits: [
        'You may struggle with deadlines and structure.',
        'You could overthink or second-guess your work.',
        'You might prefer solitude over collaboration.',
      ],
      personalityNarrative:
        'Writers, journalists, and content creators turn thoughts into impact through clarity, creativity, and dedication to their craft.',
    },
    Management: {
      openness: 20,
      conscientiousness: 35,
      extraversion: 30,
      agreeableness: 20,
      neuroticism: 12,
      positiveTraits: [
        'You organize teams and resources efficiently.',
        'You make tough decisions with fairness.',
        'You develop people and help them grow.',
      ],
      negativeTraits: [
        'You may focus too much on process over innovation.',
        'You could avoid conflict to keep peace.',
        'You might resist major changes.',
      ],
      personalityNarrative:
        'Effective managers balance structure, empathy, and execution — keeping teams aligned and productive.',
    },
    Economics: {
      openness: 25,
      conscientiousness: 35,
      extraversion: 15,
      agreeableness: 15,
      neuroticism: 15,
      positiveTraits: [
        'You analyze systems and predict outcomes accurately.',
        'You understand incentives and human behavior at scale.',
        'You communicate complex ideas simply.',
      ],
      negativeTraits: [
        'You may prefer theory over real-world messiness.',
        'You could overlook emotional or cultural factors.',
        'You might resist ideas outside established models.',
      ],
      personalityNarrative:
        'Economists excel at understanding incentives, forecasting trends, and shaping policy through rigorous analysis.',
    },
    Banking: {
      openness: 15,
      conscientiousness: 38,
      extraversion: 25,
      agreeableness: 20,
      neuroticism: 15,
      positiveTraits: [
        'You build long-term client relationships based on trust.',
        'You manage risk responsibly and ethically.',
        'You explain financial options clearly.',
      ],
      negativeTraits: [
        'You may resist rapid changes in banking technology.',
        'You could become overly cautious with new opportunities.',
        'You might prioritize compliance over innovation.',
      ],
      personalityNarrative:
        'Bankers combine precision, trustworthiness, and client focus to manage wealth and support financial goals.',
    },
    Consulting: {
      openness: 30,
      conscientiousness: 30,
      extraversion: 28,
      agreeableness: 18,
      neuroticism: 15,
      positiveTraits: [
        'You solve complex problems for diverse clients.',
        'You communicate insights clearly to executives.',
        'You adapt quickly to new industries and challenges.',
      ],
      negativeTraits: [
        'You may struggle with long-term implementation.',
        'You could spread yourself across too many projects.',
        'You might prioritize billable hours over impact.',
      ],
      personalityNarrative:
        'Consultants thrive on variety, intellect, and influence — helping organizations transform through strategy and execution.',
    },
    'Mid-Level Mgmt': {
      openness: 18,
      conscientiousness: 35,
      extraversion: 25,
      agreeableness: 25,
      neuroticism: 12,
      positiveTraits: [
        'You translate strategy into daily operations.',
        'You support and develop your team members.',
        'You maintain stability while driving improvement.',
      ],
      negativeTraits: [
        'You may feel stuck between leadership and staff.',
        'You could avoid rocking the boat too much.',
        'You might focus more on execution than vision.',
      ],
      personalityNarrative:
        'Mid-level managers are the backbone of organizations — keeping teams motivated, processes smooth, and goals on track.',
    },
    Healthcare: {
      openness: 20,
      conscientiousness: 35,
      extraversion: 20,
      agreeableness: 25,
      neuroticism: 12,
      positiveTraits: [
        'You care deeply about patient outcomes.',
        'You work well under pressure in clinical settings.',
        'You collaborate effectively with medical teams.',
      ],
      negativeTraits: [
        'You may experience emotional fatigue from patient cases.',
        'You could resist administrative changes.',
        'You might prioritize care over self-care.',
      ],
      personalityNarrative:
        'Healthcare professionals (nurses, therapists, admins) combine empathy, precision, and resilience to deliver quality patient care.',
    },
    Counseling: {
      openness: 28,
      conscientiousness: 25,
      extraversion: 18,
      agreeableness: 32,
      neuroticism: 15,
      positiveTraits: [
        'You create safe spaces for people to open up.',
        'You guide others toward clarity and growth.',
        'You remain calm and present in difficult conversations.',
      ],
      negativeTraits: [
        'You may carry clients’ pain home with you.',
        'You could avoid giving tough feedback.',
        'You might overextend to help everyone.',
      ],
      personalityNarrative:
        'Counselors and therapists help people heal and grow through deep listening, empathy, and emotional intelligence.',
    },
    'Support/Admin': {
      openness: 15,
      conscientiousness: 40,
      extraversion: 15,
      agreeableness: 25,
      neuroticism: 10,
      positiveTraits: [
        'You keep everything running smoothly behind the scenes.',
        'You anticipate needs before they arise.',
        'You are the reliable backbone people depend on.',
      ],
      negativeTraits: [
        'You may feel underappreciated at times.',
        'You could resist sudden changes to routine.',
        'You might take on too much to keep peace.',
      ],
      personalityNarrative:
        'Administrative and support professionals ensure organizations function with precision, care, and quiet excellence.',
    },
  };
