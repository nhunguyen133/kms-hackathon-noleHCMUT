const lessonsData = [
  {
    topic: "Basics",
    title: "Lesson 1: What is Critical Thinking and Why Does It Matter?",
    content: "Critical Thinking is not about always arguing or dismissing other people's opinions. In reality, it is the ability to think clearly, systematically, and base your conclusions on rational evidence rather than emotion.\n\nA good critical thinker does not easily believe everything they read online. They always ask: 'Who is saying this?', 'Why are they saying it?', and 'Where is the evidence?'. In today's era full of fake news, critical thinking is the 'shield' that protects your brain from media manipulation and scammers.\n\n**Three basic steps of critical thinking:**\n1. **Receive information with healthy skepticism:** Do not believe it immediately; pause for 3 seconds.\n2. **Analyze:** Separate facts from personal feelings or opinions.\n3. **Evaluate:** Assess the validity of the arguments before making a final conclusion.",
    quizTitle: "Quiz: Critical Thinking Fundamentals",
    questions: [
      // --- MEDIUM ---
      {
        content: "[M1] When reading a news article online, what should a critical thinker do first?",
        difficulty: "medium", topic: "Basics", correct_answer: "A",
        options: [{ key: "A", text: "Pause and ask 'Who is saying this?' and 'Where is the evidence?'" }, { key: "B", text: "Share it immediately if it sounds interesting." }, { key: "C", text: "Assume it is fake news." }, { key: "D", text: "Read only the headline." }]
      },
      {
        content: "[M2] Critical thinking is primarily about:",
        difficulty: "medium", topic: "Basics", correct_answer: "B",
        options: [{ key: "A", text: "Proving others wrong." }, { key: "B", text: "Thinking clearly and systematically based on evidence." }, { key: "C", text: "Relying on your gut feelings." }, { key: "D", text: "Accepting popular opinions." }]
      },
      {
        content: "[M3] Which of the following is an example of 'healthy skepticism'?",
        difficulty: "medium", topic: "Basics", correct_answer: "D",
        options: [{ key: "A", text: "Doubting everything everyone says." }, { key: "B", text: "Believing a trusted friend without question." }, { key: "C", text: "Ignoring facts that contradict your beliefs." }, { key: "D", text: "Pausing to verify a sensational claim before reacting." }]
      },
      
      // --- EASY ---
      {
        content: "[E1] True or False: Critical thinking means you should always argue with people.",
        difficulty: "easy", topic: "Basics", correct_answer: "B",
        options: [{ key: "A", text: "True" }, { key: "B", text: "False" }, { key: "C", text: "Only on the internet" }, { key: "D", text: "Only with strangers" }]
      },
      {
        content: "[E2] What is the first step of critical thinking mentioned in the lesson?",
        difficulty: "easy", topic: "Basics", correct_answer: "C",
        options: [{ key: "A", text: "Get angry" }, { key: "B", text: "Argue immediately" }, { key: "C", text: "Receive information with healthy skepticism" }, { key: "D", text: "Agree completely" }]
      },
      {
        content: "[E3] Which of these is a fact, not an opinion?",
        difficulty: "easy", topic: "Basics", correct_answer: "A",
        options: [{ key: "A", text: "Water boils at 100°C." }, { key: "B", text: "Summer is the best season." }, { key: "C", text: "Pizza is delicious." }, { key: "D", text: "Math is boring." }]
      },
      {
        content: "[E4] If you fail to separate facts from feelings, what might happen?",
        difficulty: "easy", topic: "Basics", correct_answer: "C",
        options: [{ key: "A", text: "You become smarter." }, { key: "B", text: "You win debates." }, { key: "C", text: "You might be easily manipulated by fake news." }, { key: "D", text: "Nothing happens." }]
      },

      // --- HARD ---
      {
        content: "[H1] Which scenario best demonstrates a failure in the 'Evaluate' step of critical thinking?",
        difficulty: "hard", topic: "Basics", correct_answer: "C",
        options: [{ key: "A", text: "Asking for the source of a statistic." }, { key: "B", text: "Identifying an emotional bias in an article." }, { key: "C", text: "Accepting an argument because the speaker sounds very confident." }, { key: "D", text: "Taking 3 seconds before hitting 'Share'." }]
      },
      {
        content: "[H2] How does 'healthy skepticism' differ from cynicism?",
        difficulty: "hard", topic: "Basics", correct_answer: "B",
        options: [{ key: "A", text: "They are exactly the same." }, { key: "B", text: "Skepticism demands evidence before believing; cynicism distrusts everything regardless of evidence." }, { key: "C", text: "Cynicism is positive, skepticism is negative." }, { key: "D", text: "Skepticism relies on emotion, cynicism relies on facts." }]
      },
      {
        content: "[H3] You read a headline: 'New study proves chocolate cures cancer!' What is the most critical next step?",
        difficulty: "hard", topic: "Basics", correct_answer: "D",
        options: [{ key: "A", text: "Buy lots of chocolate." }, { key: "B", text: "Share the article to save lives." }, { key: "C", text: "Assume it's a lie because it sounds too good." }, { key: "D", text: "Read the actual study to see if the methodology and sample size support the claim." }]
      },
      {
        content: "[H4] Why is separating facts from opinions often difficult in modern media?",
        difficulty: "hard", topic: "Basics", correct_answer: "A",
        options: [{ key: "A", text: "Because opinions are frequently disguised as facts using authoritative language." }, { key: "B", text: "Because facts no longer exist." }, { key: "C", text: "Because opinions are always shorter than facts." }, { key: "D", text: "Because no one cares about facts anymore." }]
      }
    ]
  },
  {
    topic: "Arguments",
    title: "Lesson 2: Arguments vs. Opinions",
    content: "In daily communication, we often confuse an Argument with a personal Opinion. Distinguishing between these two concepts is the first step to debating effectively.\n\n**1. Personal Opinion:**\nStatements based on personal feelings, preferences, or beliefs that do not require proof.\n*Example:* 'Durian is the most delicious fruit in the world!' -> This is an opinion. You cannot argue against someone's taste.\n\n**2. Argument:**\nA series of statements (propositions) presented to persuade others to believe something. An argument must have two parts: Premises (reasons/evidence) and a Conclusion.\n*Example:* 'Durian contains a lot of vitamin C and dietary fiber (Premise). Therefore, durian is very good for the immune and digestive systems (Conclusion).' -> This is an argument because it provides evidence to support the conclusion.\n\n**Golden Rule:** Never waste time arguing over an 'Opinion'; only engage when the other party presents an 'Argument'.",
    quizTitle: "Quiz: Arguments vs Opinions",
    questions: [
      // --- MEDIUM ---
      {
        content: "[M1] What are the two essential parts of an Argument?",
        difficulty: "medium", topic: "Arguments", correct_answer: "C",
        options: [{ key: "A", text: "Feelings and Beliefs" }, { key: "B", text: "Questions and Answers" }, { key: "C", text: "Premises and Conclusion" }, { key: "D", text: "Introduction and Summary" }]
      },
      {
        content: "[M2] Which of the following is an Argument rather than an Opinion?",
        difficulty: "medium", topic: "Arguments", correct_answer: "D",
        options: [{ key: "A", text: "I hate Mondays." }, { key: "B", text: "Cats are much better pets than dogs." }, { key: "C", text: "Everyone should watch this movie because it's awesome." }, { key: "D", text: "Because solar energy is renewable, we should invest more in it." }]
      },
      {
        content: "[M3] Why is it useless to argue over a pure Opinion?",
        difficulty: "medium", topic: "Arguments", correct_answer: "B",
        options: [{ key: "A", text: "Because opinions are always wrong." }, { key: "B", text: "Because opinions are based on personal feelings and don't require objective proof." }, { key: "C", text: "Because arguments take too much time." }, { key: "D", text: "Because the other person will get angry." }]
      },

      // --- EASY ---
      {
        content: "[E1] Which of the following is an example of a Personal Opinion?",
        difficulty: "easy", topic: "Arguments", correct_answer: "B",
        options: [{ key: "A", text: "The earth revolves around the sun." }, { key: "B", text: "Chocolate ice cream is better than vanilla." }, { key: "C", text: "Water boils at 100 degrees Celsius." }, { key: "D", text: "Plants need sunlight." }]
      },
      {
        content: "[E2] True or False: An argument requires evidence or reasons.",
        difficulty: "easy", topic: "Arguments", correct_answer: "A",
        options: [{ key: "A", text: "True" }, { key: "B", text: "False" }, { key: "C", text: "Only in science" }, { key: "D", text: "Only in court" }]
      },
      {
        content: "[E3] If someone says 'I think red is a pretty color', this is a:",
        difficulty: "easy", topic: "Arguments", correct_answer: "B",
        options: [{ key: "A", text: "Premise" }, { key: "B", text: "Opinion" }, { key: "C", text: "Argument" }, { key: "D", text: "Fact" }]
      },
      {
        content: "[E4] A 'Premise' in an argument acts as:",
        difficulty: "easy", topic: "Arguments", correct_answer: "A",
        options: [{ key: "A", text: "The evidence or reason" }, { key: "B", text: "The final decision" }, { key: "C", text: "A personal feeling" }, { key: "D", text: "A random guess" }]
      },

      // --- HARD ---
      {
        content: "[H1] Identify the premise in the following: 'Since regular exercise lowers the risk of heart disease, you should go jogging daily.'",
        difficulty: "hard", topic: "Arguments", correct_answer: "B",
        options: [{ key: "A", text: "You should go jogging daily." }, { key: "B", text: "Regular exercise lowers the risk of heart disease." }, { key: "C", text: "Both are premises." }, { key: "D", text: "Neither are premises." }]
      },
      {
        content: "[H2] Can a valid argument have false premises?",
        difficulty: "hard", topic: "Arguments", correct_answer: "A",
        options: [{ key: "A", text: "Yes, logic only dictates that IF the premises are true, the conclusion must follow." }, { key: "B", text: "No, if premises are false, it is an opinion." }, { key: "C", text: "No, a valid argument must always be completely factual." }, { key: "D", text: "Yes, but only if the conclusion is an opinion." }]
      },
      {
        content: "[H3] Which is an example of an 'enthymeme' (an argument with an unstated premise)?",
        difficulty: "hard", topic: "Arguments", correct_answer: "C",
        options: [{ key: "A", text: "I like dogs because they are fluffy." }, { key: "B", text: "All birds have wings. A penguin is a bird. Therefore a penguin has wings." }, { key: "C", text: "He is a politician, so he must be lying." }, { key: "D", text: "It is raining outside." }]
      }
    ]
  },
  {
    topic: "Fallacies",
    title: "Lesson 3: Common Logical Fallacies - Part 1",
    content: "A Fallacy is a flaw in logical thinking that makes an argument sound reasonable when it is actually completely wrong. Recognizing fallacies helps you avoid being psychologically manipulated in debates.\n\n**1. Ad Hominem (Personal Attack):**\nInstead of addressing the opponent's reasoning, a person resorts to insulting or attacking the opponent's appearance, character, or background.\n*Example:*\n- A: 'I think we should reduce plastic waste.'\n- B: 'You are just an unemployed loser, what do you know about the economy!' (B does not debate plastic waste at all but attacks A personally).\n\n**2. Straw Man Fallacy:**\nDistorting, exaggerating, or misrepresenting the opponent's argument into a weak 'straw man' version, then attacking that 'straw man' to make yourself look right.\n*Example:*\n- A: 'I think students should not have more than 2 hours of homework a day so they have time to rest.'\n- B: 'Oh, so you mean students should not study at all and just play around all day? That kind of mindset will ruin an entire generation!'",
    quizTitle: "Quiz: Spot the Fallacy",
    questions: [
      // --- MEDIUM ---
      {
        content: "[M1] Which fallacy is committed when someone distorts an opponent's argument to make it easier to attack?",
        difficulty: "medium", topic: "Fallacies", correct_answer: "A",
        options: [{ key: "A", text: "Straw Man" }, { key: "B", text: "Ad Hominem" }, { key: "C", text: "Confirmation Bias" }, { key: "D", text: "False Dilemma" }]
      },
      {
        content: "[M2] If someone says, 'Don't listen to his health advice, he's overweight!', which fallacy are they using?",
        difficulty: "medium", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "Straw Man" }, { key: "B", text: "Ad Hominem" }, { key: "C", text: "Slippery Slope" }, { key: "D", text: "None of the above" }]
      },
      {
        content: "[M3] The main difference between Ad Hominem and Straw Man is:",
        difficulty: "medium", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "Ad Hominem is about ideas, Straw Man is about people." }, { key: "B", text: "There is no difference." }, { key: "C", text: "Ad Hominem attacks the person; Straw Man attacks a distorted version of the idea." }, { key: "D", text: "Straw Man is used only in politics." }]
      },

      // --- EASY ---
      {
        content: "[E1] True or False: An Ad Hominem attack focuses on the logic of the argument.",
        difficulty: "easy", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "True" }, { key: "B", text: "False" }, { key: "C", text: "Sometimes" }, { key: "D", text: "I don't know" }]
      },
      {
        content: "[E2] What does the 'Ad Hominem' fallacy involve?",
        difficulty: "easy", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "Exaggerating an opponent's argument." }, { key: "B", text: "Attacking the person instead of their argument." }, { key: "C", text: "Assuming a small step will lead to a disaster." }, { key: "D", text: "Presenting only two options." }]
      },
      {
        content: "[E3] A 'Straw Man' in an argument refers to:",
        difficulty: "easy", topic: "Fallacies", correct_answer: "A",
        options: [{ key: "A", text: "A fake, weak version of an argument." }, { key: "B", text: "A scarecrow." }, { key: "C", text: "A strong, unbeatable point." }, { key: "D", text: "A person's character." }]
      },
      {
        content: "[E4] If I say your argument is wrong because you are ugly, I am using:",
        difficulty: "easy", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "Good logic" }, { key: "B", text: "Straw Man" }, { key: "C", text: "Ad Hominem" }, { key: "D", text: "A fact" }]
      },

      // --- HARD ---
      {
        content: "[H1] Analyze this exchange: \nX: 'We need to fund the space program to advance science.' \nY: 'Why do you hate poor people so much that you want to waste money in space?' \nWhat fallacy is Y committing?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "Ad Hominem" }, { key: "B", text: "False Dilemma" }, { key: "C", text: "Straw Man" }, { key: "D", text: "Slippery Slope" }]
      },
      {
        content: "[H2] In a debate about tax policy, Candidate A says, 'My opponent's tax plan is flawed because he was caught evading taxes himself.' Which statement is true?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "Candidate A is correct; the opponent's plan is flawed." }, { key: "B", text: "Candidate A is using an Ad Hominem fallacy; personal behavior does not automatically invalidate the math of a tax plan." }, { key: "C", text: "Candidate A is using a Straw Man fallacy." }, { key: "D", text: "Candidate A is providing a strong logical premise." }]
      },
      {
        content: "[H3] Which of the following is NOT an Ad Hominem fallacy?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "'You can't trust his theory on gravity, he dropped out of high school.'" }, { key: "B", text: "'Of course she supports rent control, she is a poor student.'" }, { key: "C", text: "'His theory on gravity is incorrect because recent experiments show different results.'" }, { key: "D", text: "'Don't believe the mechanic, he looks like a thief.'" }]
      },
      {
        content: "[H4] Why is the Straw Man fallacy so effective in public debates?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "D",
        options: [{ key: "A", text: "Because it makes the speaker look intelligent." }, { key: "B", text: "Because it relies on verified statistics." }, { key: "C", text: "Because it is impossible to refute." }, { key: "D", text: "Because it emotionally charges the audience against an extreme, fake position that is easy to hate." }]
      }
    ]
  },
  {
    topic: "Fallacies",
    title: "Lesson 4: Common Logical Fallacies - Part 2",
    content: "Let's continue exploring logical traps we easily fall into every day, especially on social media.\n\n**1. Slippery Slope:**\nAssuming that a small action A will inevitably lead to a chain of events B, C, D... and ultimately to disaster Z, even though there is no evidence to prove that connection.\n*Example:* 'If you let your kid play video games for 15 minutes, they will get addicted. If they get addicted, they will drop out of school. If they drop out, they will become criminals. Therefore, absolutely no computers allowed!'\n\n**2. False Dilemma (Black-and-White Fallacy):**\nIntentionally restricting a complex issue to only two possible choices (usually one good, one extremely bad), forcing others to choose, even though in reality there are many solutions in between.\n*Example:* 'Either you support my policy 100%, or you are an enemy of this company.' (Ignoring the fact that you might support it 50%, or have a third, better policy).",
    quizTitle: "Quiz: Advanced Logical Fallacies",
    questions: [
      // --- MEDIUM ---
      {
        content: "[M1] What characterizes a False Dilemma?",
        difficulty: "medium", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "Attacking someone's character." }, { key: "B", text: "Presenting only two extreme options when more exist." }, { key: "C", text: "Assuming a chain reaction." }, { key: "D", text: "Seeking only confirming evidence." }]
      },
      {
        content: "[M2] The Slippery Slope fallacy relies heavily on:",
        difficulty: "medium", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "Insults" }, { key: "B", text: "Facts" }, { key: "C", text: "Unproven chain reactions and fear" }, { key: "D", text: "Two extreme choices" }]
      },
      {
        content: "[M3] 'You either love this movie, or you have terrible taste in art.' This is an example of:",
        difficulty: "medium", topic: "Fallacies", correct_answer: "D",
        options: [{ key: "A", text: "Straw Man" }, { key: "B", text: "Ad Hominem" }, { key: "C", text: "Slippery Slope" }, { key: "D", text: "False Dilemma" }]
      },

      // --- EASY ---
      {
        content: "[E1] If someone says 'If you eat one donut, you will become obese forever', this is:",
        difficulty: "easy", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "False Dilemma" }, { key: "B", text: "Slippery Slope" }, { key: "C", text: "Ad Hominem" }, { key: "D", text: "Good logic" }]
      },
      {
        content: "[E2] False Dilemma is also known as:",
        difficulty: "easy", topic: "Fallacies", correct_answer: "A",
        options: [{ key: "A", text: "Black-and-White Fallacy" }, { key: "B", text: "Straw Man" }, { key: "C", text: "Chain Reaction" }, { key: "D", text: "Personal Attack" }]
      },
      {
        content: "[E3] True or False: Slippery Slope arguments usually end with a positive outcome.",
        difficulty: "easy", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "True" }, { key: "B", text: "False, they usually predict a disaster." }, { key: "C", text: "Always true" }, { key: "D", text: "Depends on the speaker" }]
      },
      {
        content: "[E4] 'Either you are with us, or you are with the terrorists.' This quote demonstrates:",
        difficulty: "easy", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "Straw Man" }, { key: "B", text: "Slippery Slope" }, { key: "C", text: "False Dilemma" }, { key: "D", text: "Ad Hominem" }]
      },

      // --- HARD ---
      {
        content: "[H1] The statement 'If we allow employees to work from home one day a week, soon they will never come to the office, and the company will go bankrupt' is an example of which fallacy?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "C",
        options: [{ key: "A", text: "Ad Hominem" }, { key: "B", text: "False Dilemma" }, { key: "C", text: "Slippery Slope" }, { key: "D", text: "Straw Man" }]
      },
      {
        content: "[H2] How can you best defeat a Slippery Slope argument?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "B",
        options: [{ key: "A", text: "By attacking the speaker." }, { key: "B", text: "By demanding evidence that one step will inevitably lead to the next." }, { key: "C", text: "By creating a False Dilemma." }, { key: "D", text: "By agreeing with the first step." }]
      },
      {
        content: "[H3] Why does False Dilemma work so well in sales and politics?",
        difficulty: "hard", topic: "Fallacies", correct_answer: "A",
        options: [{ key: "A", text: "It simplifies complex issues and forces an immediate choice." }, { key: "B", text: "It provides nuanced, detailed explanations." }, { key: "C", text: "It attacks the opponent personally." }, { key: "D", text: "It predicts the future." }]
      }
    ]
  },
  {
    topic: "Biases",
    title: "Lesson 5: Cognitive Biases and Evaluating Evidence",
    content: "Even if you know about logic and fallacies, the human brain still has built-in 'blind spots'. These are called Cognitive Biases.\n\n**1. Confirmation Bias:**\nWe only like to read, listen to, and remember information that supports our existing beliefs, while ignoring or undervaluing information that contradicts them.\n*Example:* A person who believes 'drinking lemon water cures all diseases' will only Google articles praising lemon water, and scroll past any scientific papers warning about tooth enamel damage.\n\n**2. Dunning-Kruger Effect:**\nAn ironic psychological phenomenon: People with poor knowledge or skills in a specific area often suffer from an illusion of superiority, vastly overestimating their abilities. Conversely, true experts are often humble and tend to doubt themselves.\n*Example:* A person who just read one Facebook post about medicine confidently arguing with and lecturing a doctor who has studied for 10 years.\n\n**How to overcome it:** Always ask yourself, 'Where could I be wrong?', and actively seek out information that CONTRADICTS your viewpoint before drawing a conclusion.",
    quizTitle: "Quiz: Overcoming Your Brain's Blind Spots",
    questions: [
      // --- MEDIUM ---
      {
        content: "[M1] The Dunning-Kruger effect describes a situation where:",
        difficulty: "medium", topic: "Biases", correct_answer: "D",
        options: [{ key: "A", text: "Experts overestimate their knowledge." }, { key: "B", text: "People ignore evidence they don't like." }, { key: "C", text: "People create false dilemmas." }, { key: "D", text: "People with low ability overestimate their competence." }]
      },
      {
        content: "[M2] If I only watch news channels that agree with my political views, I am showing:",
        difficulty: "medium", topic: "Biases", correct_answer: "B",
        options: [{ key: "A", text: "Dunning-Kruger Effect" }, { key: "B", text: "Confirmation Bias" }, { key: "C", text: "Straw Man" }, { key: "D", text: "Ad Hominem" }]
      },
      {
        content: "[M3] Why are cognitive biases different from logical fallacies?",
        difficulty: "medium", topic: "Biases", correct_answer: "C",
        options: [{ key: "A", text: "They are exactly the same." }, { key: "B", text: "Fallacies are about psychology, biases are about math." }, { key: "C", text: "Fallacies are errors in arguments; biases are built-in psychological blind spots." }, { key: "D", text: "Biases only affect smart people." }]
      },

      // --- EASY ---
      {
        content: "[E1] What is Confirmation Bias?",
        difficulty: "easy", topic: "Biases", correct_answer: "A",
        options: [{ key: "A", text: "Seeking information that confirms existing beliefs." }, { key: "B", text: "Overestimating one's own abilities." }, { key: "C", text: "Attacking a person instead of an argument." }, { key: "D", text: "Assuming a chain of terrible events." }]
      },
      {
        content: "[E2] True or False: Experts often doubt themselves due to the Dunning-Kruger effect.",
        difficulty: "easy", topic: "Biases", correct_answer: "A",
        options: [{ key: "A", text: "True" }, { key: "B", text: "False" }, { key: "C", text: "Only in math" }, { key: "D", text: "Only online" }]
      },
      {
        content: "[E3] To overcome biases, you should ask yourself:",
        difficulty: "easy", topic: "Biases", correct_answer: "B",
        options: [{ key: "A", text: "Why am I always right?" }, { key: "B", text: "Where could I be wrong?" }, { key: "C", text: "How can I win this?" }, { key: "D", text: "Who can I attack?" }]
      },
      {
        content: "[E4] If a beginner thinks they are a master after one day of practice, this is:",
        difficulty: "easy", topic: "Biases", correct_answer: "C",
        options: [{ key: "A", text: "Confirmation Bias" }, { key: "B", text: "Straw Man" }, { key: "C", text: "Dunning-Kruger Effect" }, { key: "D", text: "False Dilemma" }]
      },

      // --- HARD ---
      {
        content: "[H1] Which of the following is the best strategy to overcome Confirmation Bias?",
        difficulty: "hard", topic: "Biases", correct_answer: "B",
        options: [{ key: "A", text: "Read more articles that agree with your opinion." }, { key: "B", text: "Actively seek out information that contradicts your viewpoint." }, { key: "C", text: "Trust your initial intuition." }, { key: "D", text: "Ignore all experts." }]
      },
      {
        content: "[H2] How does the algorithm of social media platforms amplify Confirmation Bias?",
        difficulty: "hard", topic: "Biases", correct_answer: "A",
        options: [{ key: "A", text: "By showing you content similar to what you already like and engage with (Filter Bubble)." }, { key: "B", text: "By randomly displaying content." }, { key: "C", text: "By forcing you to read opposing views." }, { key: "D", text: "By fact-checking every post." }]
      },
      {
        content: "[H3] Why does the Dunning-Kruger effect occur in beginners?",
        difficulty: "hard", topic: "Biases", correct_answer: "C",
        options: [{ key: "A", text: "Because they are actually experts." }, { key: "B", text: "Because they know how much they don't know." }, { key: "C", text: "Because they lack the metacognitive ability to recognize their own incompetence." }, { key: "D", text: "Because society praises beginners too much." }]
      }
    ]
  }
];

module.exports = lessonsData;
