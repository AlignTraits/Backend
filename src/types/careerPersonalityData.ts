// src/data/careerPersonalityData.ts
// FULLY COMPLETE – 29 careers with human-written details (2025 ready)
// Re-edited by Tosin to work on the narrative

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
        'Individuals suited for law careers often exhibit moderate extraversion and conscientiousness, giving them the confidence to speak persuasively and the discipline to prepare meticulously. They combine strong analytical thinking with assertive communication, and lower agreeableness makes them comfortable challenging opposing views rather than seeking consensus for its own sake. Moderate neuroticism keeps them alert to risk and consequence without becoming overwhelmed, while a naturally competitive streak drives them to advocate forcefully for outcomes they believe are just. This trait profile favors objective reasoning over emotional appeal, and it produces people who are resilient under scrutiny, comfortable with conflict, and driven by principle as much as by winning.\n\nThis personality mix translates directly into strength across litigation, corporate law, and policy advising, where logical reasoning and articulate argument carry the day. Assertiveness and competitiveness are assets in negotiation and courtroom advocacy, though they can create friction in collaborative team settings. Moderate neuroticism sharpens focus under pressure but can generate stress around ethical dilemmas or uncertain case outcomes. Overall, these traits suit roles demanding intellectual rigor and ethical steadfastness, and law professionals shaped this way often become influential in setting legal precedent. Their analytical skill drives thorough case preparation, while extraversion builds the professional networks that sustain a practice across specialties from criminal defense to international law.',
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
        "People drawn to finance careers tend to combine high conscientiousness with moderate extraversion, giving them the discipline for meticulous record-keeping and the confidence to engage clients and stakeholders. They approach risk calmly and methodically, preferring proven frameworks over speculative bets, and lower openness means they're more comfortable refining established processes than inventing new ones. Moderate agreeableness allows for persuasive rapport-building without sacrificing firmness in negotiations, while moderate neuroticism keeps them watchful of market shifts, sometimes tipping into anxiety when conditions turn volatile. Overall, this is a personality built for precision, patience, and steady judgment under financial pressure.\nIn practice, these traits translate into strength across banking, investment advisory, and corporate finance, where reliability and strategic decision-making matter more than improvisation. Their organizational skills support strict compliance and accurate forecasting, while extraversion helps them build the client relationships that finance work depends on. Lower openness can slow adoption of new financial technologies or unconventional strategies, and market downturns tend to trigger stress given their moderate neuroticism. Even so, these traits suit roles requiring data-driven insight and ethical rigor, making people with this profile well positioned for wealth management, financial planning, and long-term fiscal stewardship across a range of institutions and client relationships.",
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
        "People suited to data science typically pair high openness with strong conscientiousness, making them naturally curious about patterns while remaining disciplined enough to validate every result. They enjoy exploring unfamiliar problems and building creative models, but they balance that curiosity with a meticulous, almost perfectionist attention to accuracy. Low extraversion means they're most comfortable working independently or in small focused groups rather than large collaborative settings, and moderate neuroticism can produce real stress when data is ambiguous or incomplete. This combination favors quiet, sustained concentration over quick, high-visibility wins.\nThese traits map closely onto careers in machine learning, predictive analytics, and big-data research, where independent thinking and technical precision are prized above social performance. Their innovative streak drives creative model design, while conscientiousness ensures the validation and testing that make results trustworthy. Limited extraversion can make team-based projects or stakeholder presentations less comfortable, and tight deadlines paired with uncertain outcomes can heighten stress. Still, this profile is well suited to roles across tech, finance, and healthcare analytics, where turning raw data into actionable insight matters more than constant collaboration, and disciplined curiosity consistently produces reliable, high-value results.",
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
        'Engineers are frequently characterized by very high conscientiousness paired with moderate agreeableness, producing people who are methodical, detail-oriented, and genuinely committed to getting a design right the first time. They favor structured, proven approaches over untested ideas, and lower openness reflects a preference for reliability over experimentation. Quieter by nature, with lower extraversion, they do their best thinking with focused, individual effort rather than in large group brainstorms. Moderate neuroticism sharpens their vigilance around safety and precision, though it can also produce real strain when projects grow complex or deadlines tighten.\n\nThis personality profile is a strong fit for civil, mechanical, and electrical engineering, where attention to detail and safety cannot be compromised. Their conscientiousness drives efficient resource management and technically sound solutions, while agreeableness supports the collaboration engineering teams still require despite lower extraversion. Caution around new methods can slow adoption of emerging technologies, and high-stakes projects with tight timelines tend to raise stress levels. Even so, these traits consistently support infrastructure development, manufacturing, and systems optimization, and engineers with this profile are the ones organizations trust to deliver resilient, dependable structures and devices that quietly improve everyday life.',
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
        "People suited to research careers typically show high openness paired with equally high conscientiousness, blending genuine intellectual curiosity with the rigor needed to see an investigation through to the end. They're drawn to theoretical questions and enjoy sitting with complexity rather than rushing toward simple answers, and their persistence shows up as a willingness to revisit and refine a methodology many times over. Low extraversion means they generally prefer solitary or small-group work to large collaborative settings, and moderate neuroticism can turn into real anxiety when results are inconclusive or funding feels uncertain.\nIn academic, laboratory, or think-tank settings, this combination drives genuine scientific breakthroughs, since independent thinking and methodological rigor are exactly what discovery requires. Their curiosity fuels exploration into new territory, while conscientiousness ensures findings are validated rather than assumed. Limited extraversion can make networking or public dissemination of results more effortful, and the pressure of ambiguous outcomes or grant cycles can weigh on their moderate neuroticism. Nonetheless, this profile consistently supports evidence-based advances across physics, biology, and the social sciences, positioning researchers with these traits to meaningfully expand human understanding and inform both policy and technology.",
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
        "IT professionals tend to combine moderate conscientiousness with moderate openness, giving them the reliability to maintain complex systems and the flexibility to keep pace with changing technology. They're natural troubleshooters, comfortable diagnosing problems methodically rather than guessing, and they adapt readily when new tools or platforms arrive. Lower extraversion means they generally prefer working through technical problems over extended social interaction, and moderate neuroticism helps them stay composed during outages or crises, even though it can spike under sustained pressure. Assertiveness in professional settings is sometimes a weaker point for this profile.\nThese traits fit naturally into network administration, cybersecurity, and software support, where efficiency and dependability matter more than visibility. Their adaptability keeps digital infrastructure current, while conscientiousness ensures systems stay stable and well-maintained. Lower extraversion can limit comfort with heavily user-facing support work, and repeated system failures or high user demand can add real stress over time. Still, this combination suits the fast-moving, always-learning nature of IT work, and professionals with this profile are the ones organizations rely on to keep technology running smoothly, safeguard data, and enable the connectivity that modern business and daily life depend on.",
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
        'People suited to medicine typically show high conscientiousness balanced evenly across openness, extraversion, and agreeableness, producing a well-rounded, resilient personality. They combine genuine empathy for patients with the decisiveness needed in emergencies, and their broad curiosity supports comprehensive knowledge across specialties. Low neuroticism gives them notable emotional stability, allowing calm, clear-headed judgment even in high-pressure situations. This steadiness can come at a personal cost, though, since it often masks the fatigue and emotional toll of long hours and difficult outcomes rather than eliminating it.\n\nThis balanced profile suits surgery, general practice, and specialized care equally well, since these roles demand both precision and genuine human connection. Their conscientiousness supports accurate diagnosis and consistent treatment planning, while balanced extraversion helps them communicate clearly with patients, families, and care teams. Emotional stability allows for resilience during crises, though the same composure can lead them to neglect their own self-care and push through exhaustion. Even so, this trait combination consistently produces professionals who advance health outcomes and medical knowledge, using decisiveness to save lives and broad expertise to deliver thoughtful, holistic patient care.',
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
        'People drawn to government careers often show high extraversion paired with solid conscientiousness, making them natural communicators who are also organized enough to manage complex administrative work. They gravitate toward leadership and public-facing roles, comfortable representing policies to broad and varied audiences. Lower agreeableness gives them a firmer edge in enforcement and negotiation, though it can also create friction when consensus is needed. Moderate neuroticism keeps them cautious in high-stakes decisions, but the inherently political environment they work in can still generate real, sustained stress over time.\n\nThis personality mix fits well with civil service, diplomacy, and regulatory oversight, where communication and organizational skill drive effective governance. Extraversion supports the stakeholder engagement public administration constantly requires, while conscientiousness keeps policy implementation on track. A tendency toward firm enforcement can occasionally tip into over-bureaucratizing simple processes, and complex political situations may expose some indecisiveness. Despite this, professionals with this profile consistently contribute to societal welfare and policy development, using leadership to foster accountability and organizational discipline to streamline operations, making them well suited to sustaining democratic processes and responding to community needs.',
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
        'Accountants are defined above all by exceptionally high conscientiousness, producing people who are detail-oriented, reliable, and deeply committed to precision in everything they touch. They favor established procedures over untested methods, and lower openness reflects genuine comfort with routine and structure rather than a desire for novelty. Moderate agreeableness supports steady, trustworthy working relationships, while moderate neuroticism drives careful error-checking, sometimes tipping into real anxiety when discrepancies appear. This is a personality built for consistency, caution, and an almost instinctive resistance to cutting corners.\n\nThese traits are a strong match for auditing, tax consulting, and bookkeeping, where accuracy and adherence to standards matter more than innovation. Their conscientiousness ensures financial reporting stays accurate and compliant, supporting the integrity that businesses and regulators depend on. Lower openness can make adapting to new regulations or emerging technologies more difficult, occasionally leading to rigidity. The anxiety that comes with their moderate neuroticism, while uncomfortable, also reinforces the careful double-checking that catches costly errors. Overall, accountants with this profile build the investor confidence and financial transparency that organizations need to operate responsibly over the long term.',
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
        'People suited to public relations typically combine high openness with high extraversion, making them naturally expressive, socially confident, and drawn to crafting compelling stories. They adapt easily to new narratives and shifting media landscapes, and they build professional relationships with genuine ease. Lower conscientiousness means they favor spontaneity and flexibility over rigid planning, which can translate into impulsive decisions or loosely managed schedules. Low neuroticism gives them notable composure under public scrutiny, letting them stay level-headed even when a story turns unfavorable or a crisis breaks unexpectedly.\n\nThis profile thrives in crisis communication, brand promotion, and event planning, where creativity and social fluency drive engaging campaigns. Their openness fuels fresh, adaptable messaging, while extraversion builds the networks and stakeholder trust that reputation management depends on. Lower conscientiousness can mean overlooked details or missed deadlines in fast-moving environments, and a preference for variety can make routine, repetitive tasks feel draining. Even so, professionals with this combination consistently enhance organizational image and shape positive public perception, using adaptability to navigate evolving media and composure to keep communication steady during high-pressure moments.',
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
        "People suited to leadership roles are marked by very high extraversion, giving them natural confidence, charisma, and the drive to motivate others toward a shared goal. They combine strong ambition with genuine adaptability, thriving amid change rather than being unsettled by it. Lower agreeableness makes them comfortable making tough, unpopular calls and holding their ground under pressure, though it can also mean less attentiveness to team members' emotional needs. Moderate neuroticism supports resilience through setbacks, while their competitive instinct keeps them focused on results, sometimes at the expense of relational nuance.\nThis personality profile is well matched to executive management, entrepreneurship, and organizational change, where initiative and charisma directly drive outcomes. Extraversion fuels team motivation and strategic visioning, while adaptability helps navigate the uncertainty that comes with ambitious goals. Lower agreeableness can create friction or overlooked team needs in the pursuit of results, and fast-paced planning sometimes skips over important details. Despite these tradeoffs, leaders with this profile consistently drive organizational success and cultural change, using ambition to inspire progress and adaptability to guide teams confidently through evolving, high-performance environments.",
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
        "People drawn to HR careers typically pair high agreeableness with high openness, producing a genuinely empathetic personality that welcomes diverse perspectives and backgrounds. They read interpersonal and workforce dynamics with real insight, and their warmth makes them a natural point of trust for employees navigating difficult situations. Lower extraversion means they're more comfortable with thoughtful, one-on-one conversations than constant public visibility, and moderate neuroticism heightens their sensitivity to workplace issues, sometimes at the cost of emotional fatigue from absorbing others' concerns. Directness in confrontation can be a genuine challenge for this profile.\nThese traits fit naturally into recruitment, training, and conflict resolution, where empathy and insight into people are the core of the job. Their agreeableness fosters inclusive, harmonious workplaces, while openness supports thoughtful, forward-looking HR policy. Lower extraversion can limit comfort with heavily public-facing responsibilities, and a tendency to avoid direct confrontation may mean difficult conversations get delayed. Even so, HR professionals with this profile consistently strengthen company culture and employee relations, using empathy to build trust and openness to shape inclusive practices that support both workforce development and organizational cohesion.",
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
        "Teachers are often characterized by high agreeableness combined with solid conscientiousness, producing patient, dependable people who genuinely care about the growth of those they work with. They organize their time and materials carefully, and their warmth makes them naturally motivating to the people they mentor. Low neuroticism gives them a steady emotional baseline that helps them stay calm through classroom challenges, though their high agreeableness can tip into over-accommodation, prioritizing others' needs above their own. Moderate extraversion allows them to engage a room without becoming overwhelmed by constant social demand.\nThis profile suits education at every level, where patience and organization are what actually produce learning. Agreeableness supports the supportive environments students need to thrive, while conscientiousness keeps lessons structured and consistently delivered. A tendency to over-accommodate can lead them to sacrifice personal time for their students, and the sustained emotional energy teaching requires can eventually produce burnout. Even so, educators with this profile play an outsized role in shaping future generations, using inspiration to spark curiosity and organizational discipline to turn diverse curricula into lessons that genuinely reach the students in front of them.",
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
        "People suited to marketing careers typically combine high openness with strong extraversion, producing a natural storyteller who reads consumer behavior instinctively and enjoys turning fresh ideas into public-facing campaigns. They gravitate toward new platforms, trends, and creative formats rather than sticking with what already works, and their social confidence makes pitching and presenting feel energizing rather than draining. Lower conscientiousness reflects a preference for iteration and spontaneity over rigid process, which can show up as restlessness with repetitive or highly structured tasks. Low-to-moderate neuroticism keeps them generally composed, though real impatience can surface when a campaign's results take longer to materialize than their creative instincts expect.\nThis profile fits naturally into brand strategy, digital campaigns, and content marketing, where creative range and social fluency matter more than procedural consistency. Openness fuels the constant reinvention that marketing trends demand, while extraversion builds the client and stakeholder relationships campaigns depend on to get approved and amplified. Lower conscientiousness can mean details slip or too many campaigns get taken on at once, and a preference for fast feedback loops makes marketers with this profile prone to frustration when metrics move slowly. Even so, professionals with this trait mix consistently turn abstract ideas into campaigns that resonate and convert, using adaptability to stay ahead of shifting platforms and creative energy to keep a brand's voice distinct in a crowded market.",
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
        "People drawn to entrepreneurship typically pair very high extraversion with strong openness, giving them the confidence to pitch untested ideas and the curiosity to keep spotting opportunities others overlook. They lead teams and rally support even without formal authority, driven by a genuine comfort with ambiguity and change. Notably low agreeableness means they're willing to make unpopular calls, challenge conventional wisdom, and prioritize the mission over consensus, which can also make collaboration feel less like a priority. Moderate-to-high neuroticism keeps them alert to risk, but the same sensitivity can tip into real anxiety during the inevitable setbacks and rejections that come with building something new.\nThis trait combination is a strong match for founding, early-stage leadership, and venture building, where vision and resilience matter more than adherence to established process. Extraversion drives the storytelling and team rallying that early-stage ventures depend on, while openness fuels the constant reinvention startups require to find product-market fit. Lower agreeableness can create friction with co-founders or investors when priorities diverge, and moderate conscientiousness means routine operations and long-term structure are rarely a natural strength. Despite these tradeoffs, entrepreneurs with this profile consistently turn ambiguous opportunities into functioning businesses, using charisma to attract early believers and resilience to keep moving through the rejection and uncertainty that founding almost always involves.",
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
        'People suited to sales careers are defined above all by very high extraversion, producing natural energy, comfort with rejection, and a genuine enjoyment of constant human interaction. They build rapport quickly and read people well, and moderate conscientiousness gives them enough discipline to follow up and close without becoming rigidly process-driven. Lower openness and agreeableness reflect a pragmatic, results-focused streak — more interested in what works right now than in exploring alternatives or smoothing over every disagreement. Moderate neuroticism shows up as restlessness without a clear target rather than anxiety, keeping them motivated by tangible goals and measurable wins.\n\nThis profile fits naturally into account executive roles, business development, and client-facing sales, where resilience and interpersonal energy directly drive revenue. Extraversion builds the trust and rapport that turn cold conversations into lasting client relationships, while their pragmatic focus keeps attention on outcomes rather than process for its own sake. Lower openness can mean less appetite for long-term strategic thinking, and the drive to close deals sometimes tips into overpromising just to get a yes. Even so, salespeople with this profile consistently turn conversations into revenue, using genuine persistence to handle rejection gracefully and people skills to build the relationships that keep clients coming back.',
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
        "People suited to psychology-oriented roles typically balance high openness with high agreeableness, producing a genuinely curious, non-judgmental listener who is comfortable sitting with other people's complexity. They pick up on emotional nuance easily and combine empathy with real insight into what's driving a person's behavior. Lower extraversion means they do their best work in quiet, one-on-one settings rather than large groups, and low neuroticism gives them a notably steady emotional baseline that lets them stay calm and present even in emotionally charged conversations. This steadiness can mask real strain, though, since it often means absorbing a client's emotional weight rather than being visibly affected by it.\nThis trait combination is a strong fit for clinical psychology, therapy, and research into human behavior, where empathy and insight matter more than social performance. Openness supports genuine curiosity about what shapes a person's inner life, while agreeableness builds the trust that makes people willing to be vulnerable in the first place. Lower extraversion can make large group facilitation or public speaking less comfortable, and their calm exterior sometimes means necessary confrontation gets avoided rather than addressed directly. Still, professionals with this profile consistently help others gain self-understanding and move toward healthier patterns, using deep listening to build trust and steady presence to hold space for genuinely difficult emotional work.",
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
        "People drawn to social work are defined above all by very high agreeableness, combined with solid openness that keeps them attuned to the different circumstances and backgrounds of the people they serve. This produces a deep, almost instinctive commitment to justice and to advocating for people who often can't advocate for themselves. Moderate conscientiousness supports the follow-through that casework requires, while lower extraversion means they tend to build trust through sustained one-on-one engagement rather than broad public visibility. Moderate neuroticism keeps them emotionally responsive to the hardship they witness, which sustains their empathy but also leaves them genuinely vulnerable to compassion fatigue over time.\nThis profile fits well with child welfare, community advocacy, and case management, where resilience and genuine care for vulnerable populations matter more than detachment or efficiency alone. Their agreeableness builds the trust that makes people willing to accept help, while openness keeps them responsive to each client's specific circumstances rather than applying one-size-fits-all solutions. The same emotional investment that makes them effective can also mean taking systemic setbacks and bureaucratic limitations personally, and sustained empathy without enough recovery time can wear them down. Even so, social workers with this profile consistently create lasting change in individual lives and communities, using hope and persistence to keep showing up for people navigating some of the hardest circumstances of their lives.",
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
        "People suited to general business and management roles typically combine solid conscientiousness with strong extraversion, giving them both the discipline to execute a plan and the confidence to lead the people carrying it out. Moderate openness supports strategic thinking without pulling them away from practical, big-picture decision-making. Lower agreeableness means they're comfortable prioritizing results and holding people accountable rather than optimizing for consensus, which can occasionally come at the expense of relationship-building. Low neuroticism gives them a steady, even keel under pressure, though it can also mean patience runs thin with slow processes or indecision.\nThis trait combination suits general management, operations, and strategic leadership, where organizing people and resources toward a shared goal is the core of the job. Conscientiousness keeps execution on track and accountable, while extraversion drives the team alignment and stakeholder communication that growing organizations depend on. Lower agreeableness can mean relationships take a backseat to results when priorities conflict, and their low tolerance for slow processes sometimes shows up as impatience with teams that move more cautiously. Despite these tradeoffs, business leaders with this profile consistently balance strategy with execution, using decisiveness to keep organizations moving and people skills to rally teams around a common direction.",
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
        "People suited to startup environments typically pair very high openness with very high extraversion, producing someone who genuinely thrives on ambiguity and is energized rather than drained by constant change. They move fast, take on unfamiliar responsibilities without much hesitation, and rally early teams around a vision that's still being figured out in real time. Lower conscientiousness reflects real comfort with improvisation over process, which fits early-stage chaos but can create real friction once a company needs structure to scale. Moderate-to-high neuroticism means the relentless pace and constant uncertainty of startup life can produce genuine burnout if not actively managed.\nThis profile fits naturally into early-stage founding teams and high-growth startup roles, where adaptability and ownership matter more than specialization or established process. Openness fuels the constant pivoting and experimentation early startups require, while extraversion helps rally scrappy teams and early believers around a still-forming vision. Lower conscientiousness can mean operational details get overlooked as the company grows past its early chaotic stage, and the sustained hustle this environment demands can wear down even genuinely resilient people. Even so, professionals with this trait mix consistently thrive in the uncertainty that defines early-stage companies, using speed and energy to build the future one pivot at a time.",
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
        "People suited to writing and content creation are defined above all by very high openness, producing a mind that's constantly observing, reframing, and translating experience into language. They're drawn to nuance and complexity rather than simple answers, and they improve genuinely with each draft rather than treating a first attempt as final. Very low extraversion means they do their best work alone, with sustained focus rather than constant collaboration, and moderate neuroticism can turn into real self-doubt, since sensitivity to craft often comes paired with a tendency to overthink or second-guess finished work. Lower conscientiousness reflects a comfort with nonlinear process — inspiration and revision rather than rigid deadlines.\nThis profile is a strong fit for journalism, content creation, and long-form writing, where original perspective and careful craft matter more than social performance or fast turnaround. Openness fuels the ability to notice what others miss and express it clearly, while their solitary focus supports the sustained concentration good writing requires. Very low extraversion can make collaborative newsroom or team-writing environments less comfortable, and lower conscientiousness sometimes shows up as real difficulty with deadlines and structure. Despite these tradeoffs, writers with this profile consistently turn observation into impact, using dedication to craft and honest self-revision to produce work that clarifies and moves the people who read it.",
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
        'People suited to management roles typically combine high conscientiousness with strong extraversion, giving them both the organizational discipline to keep a team running smoothly and the social confidence to lead people directly. Lower openness reflects a preference for proven, reliable approaches over constant reinvention, and moderate agreeableness lets them make fair but firm decisions without becoming overly accommodating. Low neuroticism gives them notable steadiness under pressure, which supports consistent, level-headed decision-making, though that same steadiness can also mean avoiding necessary conflict just to preserve calm.\n\nThis trait combination fits well with team leadership, operations management, and people development, where consistency and fairness matter as much as results. Conscientiousness keeps resources and schedules organized, while extraversion supports the regular, direct communication that keeps teams aligned. Lower openness can mean resistance to major process changes or new ways of working, and their conflict-avoidant streak sometimes lets underlying tension go unaddressed for too long. Even so, managers with this profile consistently keep teams productive and growing, using structure to maintain stability and genuine investment in people to help their teams develop over time.',
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
        "People suited to economics careers typically show high conscientiousness paired with moderate openness, producing someone who is both intellectually curious about how systems work and disciplined enough to test those ideas rigorously against data. They're drawn to identifying patterns in human behavior and incentives rather than accepting surface-level explanations. Lower extraversion means they prefer careful, independent analysis over constant collaboration or persuasion, and low agreeableness supports a willingness to follow evidence even when it contradicts popular opinion or established theory. Moderate neuroticism keeps them measured rather than anxious, generally comfortable holding ambiguity until the data resolves it.\nThis profile fits naturally into policy analysis, forecasting, and academic or applied economic research, where analytical rigor matters more than persuasive charisma. Conscientiousness supports the careful modeling and data validation good economic analysis depends on, while their comfort with abstraction helps them simplify complex systems into communicable ideas. Lower extraversion can make stakeholder-facing communication feel more effortful, and a preference for established models sometimes means real-world complexity or emotional factors get underweighted. Despite this, economists with this profile consistently turn rigorous analysis into forecasts and policy that shape real decisions, using disciplined thinking to make sense of systems that are otherwise too complex to act on with confidence.",
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
        "People suited to banking careers are defined above all by very high conscientiousness, producing someone precise, dependable, and genuinely committed to managing other people's money responsibly. Moderate extraversion supports the client relationships banking depends on, while very low openness reflects real comfort with established procedures and proven financial frameworks over untested approaches. Moderate agreeableness helps them build trust without losing firmness on risk decisions, and moderate neuroticism keeps them appropriately cautious, watchful for exposure without becoming reactive.\nThis trait combination fits well with retail banking, wealth management, and credit and risk roles, where trust and precision matter more than innovation for its own sake. Conscientiousness ensures accuracy and regulatory compliance stay non-negotiable, while their client focus builds the long-term relationships banking relies on. Very low openness can slow adoption of new financial technology or products, and a cautious streak sometimes means promising opportunities get passed over in favor of certainty. Even so, bankers with this profile consistently earn the trust that financial stewardship requires, using precision to safeguard client assets and clear communication to help people make sound, well-informed financial decisions.",
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
        "People suited to consulting careers typically balance high openness with high conscientiousness, giving them both the intellectual flexibility to approach unfamiliar problems and the discipline to structure a rigorous answer under a deadline. Strong extraversion supports the client-facing communication consulting constantly demands, while lower agreeableness means they're comfortable delivering an honest, sometimes unwelcome recommendation rather than softening it for comfort. Moderate neuroticism keeps them composed across constantly shifting projects and industries, generally energized rather than destabilized by variety.\nThis profile fits naturally into strategy, management, and specialized advisory consulting, where adaptability and clear communication matter more than deep specialization in any one domain. Openness fuels rapid learning across new industries and problems, while conscientiousness ensures recommendations are backed by real analysis rather than guesswork. Extraversion builds the executive relationships that get recommendations actually implemented, though the project-based nature of the work means long-term follow-through on outcomes is often out of their hands. Despite that tradeoff, consultants with this profile consistently help organizations navigate complex change, using intellectual range to diagnose problems quickly and influence to help clients act on what they find.",
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
        "People suited to mid-level management typically show high conscientiousness balanced by moderate extraversion and agreeableness, producing someone dependable enough to keep daily operations running and personable enough to support the people executing them. Lower openness reflects a preference for proven processes over constant reinvention, well suited to translating strategy into consistent, repeatable execution. Low neuroticism gives them genuine steadiness, letting them absorb pressure from both leadership and staff without becoming reactive, though that same steadiness can tip into avoiding necessary friction rather than confronting it directly.\nThis trait combination fits well with team supervision, operations coordination, and departmental management, where reliability and people support matter more than bold vision. Conscientiousness keeps processes and schedules on track, while their balanced agreeableness and extraversion support both team development and clear day-to-day communication. Lower openness can mean resistance to significant organizational change, and a tendency to avoid rocking the boat sometimes means execution gets prioritized over pushing back on flawed strategy. Even so, mid-level managers with this profile consistently keep organizations functioning day to day, using stability to support their teams and consistent follow-through to turn leadership's plans into real results.",
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
        'People suited to healthcare support and clinical roles typically combine high conscientiousness with solid agreeableness, producing someone precise under pressure and genuinely invested in patient wellbeing. Lower openness reflects comfort with established clinical protocols over improvisation, appropriate given how much accuracy patient care requires. Moderate extraversion supports the teamwork clinical settings depend on without requiring constant social energy, and low neuroticism gives them real composure in high-stakes moments, letting them function clearly when others might freeze. That same composure, though, often comes at a personal cost, masking accumulated emotional fatigue rather than resolving it.\n\nThis profile fits naturally into nursing, allied health, and clinical support roles, where precision and genuine care for patients matter more than administrative efficiency alone. Conscientiousness supports the accuracy that clinical protocols demand, while agreeableness builds the trust patients need to feel safe in difficult moments. Their steadiness under pressure is a real asset in emergencies, but it can also mean administrative changes get resisted and self-care gets deprioritized in favor of patient needs. Despite this, healthcare professionals with this profile consistently deliver quality patient care under real pressure, using precision to get clinical details right and resilience to keep showing up for patients even after a demanding shift.',
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
        "People suited to counseling careers are defined above all by very high agreeableness, paired with solid openness that keeps them genuinely curious about each person's unique circumstances rather than applying generic advice. This combination produces a natural ability to create safe, nonjudgmental space for people to be honest about what they're struggling with. Lower extraversion means they do their best work in quiet, focused one-on-one settings rather than large group facilitation, and moderate neuroticism keeps them emotionally attuned to a client's pain, which supports genuine empathy but also means they can end up carrying that pain home with them.\nThis trait combination is a strong fit for therapy, counseling, and guidance-focused roles, where deep listening and emotional presence matter more than directive advice-giving. Agreeableness builds the trust that makes vulnerable conversations possible, while openness keeps them responsive to each client's specific situation rather than a one-size-fits-all approach. Their instinct to stay warm and supportive can mean necessary but uncomfortable feedback gets softened or delayed, and a genuine desire to help everyone can lead to overextending past sustainable limits. Even so, counselors with this profile consistently help people move toward clarity and growth, using calm presence to hold space during hard conversations and genuine empathy to guide people toward healthier patterns.",
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
        "People suited to administrative and support roles are defined above all by very high conscientiousness, producing someone exceptionally organized, dependable, and quietly focused on keeping everything around them running smoothly. Moderate agreeableness supports genuine care for the people they support, often anticipating needs before they're even voiced. Lower openness and extraversion reflect a preference for consistent, well-understood routines over constant novelty or social visibility, and very low neuroticism gives them remarkable steadiness, rarely rattled even when things get busy.\nThis profile fits naturally into administrative support, office management, and operational coordination, where consistency and anticipation of needs matter more than visibility or recognition. Conscientiousness ensures details don't get missed and systems stay organized, while agreeableness supports the service-oriented mindset that makes them genuinely reliable to the people who depend on them. Lower openness can mean resistance to sudden changes in routine, and their tendency to prioritize peace can lead them to take on more than their share rather than push back. Despite often going underappreciated, professionals with this profile are the reliable backbone organizations depend on, using precision and quiet dedication to keep operations running with genuine care and consistency.",
    },
  };
