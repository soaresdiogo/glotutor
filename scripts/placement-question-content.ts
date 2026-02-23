/**
 * Placement test question content (English). One entry = one question.
 * Used by seed to insert multiple questions per level and type so the
 * adaptive test can ask 3 different questions per level without reuse.
 *
 * Rules: PLACEMENT_MIN_QUESTIONS_PER_LEVEL = 3, PLACEMENT_PERFECT_SCORE_TO_SKIP = 3.
 * "Listening" here is response-choice (no audio): "You hear: '...' — Best response?"
 */

export type QuestionContent = {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
};

type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const PLACEMENT_QUESTIONS: Record<
  Level,
  Record<string, QuestionContent[]>
> = {
  A1: {
    reading_comprehension: [
      {
        questionText:
          'Read: "The weather today is sunny and warm. Many people are going to the park." What are people doing?',
        options: [
          'Going to the park',
          'Staying at home',
          'Going to work',
          'Closing the windows',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          'Read: "Maria has a dog. The dog is small and brown. She plays with it every day." What colour is the dog?',
        options: ['Brown', 'Black', 'White', 'Grey'],
        correctOptionIndex: 0,
      },
      {
        questionText:
          'Read: "I get up at seven. I eat breakfast at half past seven. I go to work at eight." When does the person eat breakfast?',
        options: ['At 7:00', 'At 7:30', 'At 8:00', 'At 6:30'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "This is my family. I have one brother and one sister. We live in a big house." How many children are in the family?',
        options: ['Two', 'Three', 'Four', 'One'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The shop opens at nine and closes at six. It is closed on Sunday." When is the shop closed?',
        options: ['On Saturday', 'On Sunday', 'At nine', 'At six'],
        correctOptionIndex: 1,
      },
    ],
    vocabulary: [
      {
        questionText:
          "Choose the best meaning of 'happy' in: I am happy to see you.",
        options: ['Pleased or glad', 'Sad', 'Angry', 'Tired'],
        correctOptionIndex: 0,
      },
      {
        questionText: "What does 'big' mean in: I have a big family?",
        options: ['Small', 'Large', 'New', 'Old'],
        correctOptionIndex: 1,
      },
      {
        questionText: "Choose the best meaning of 'quickly': She ran quickly.",
        options: ['Slowly', 'Fast', 'Quietly', 'Loudly'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What is the opposite of 'hot'?",
        options: ['Warm', 'Cold', 'Wet', 'Dry'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'tomorrow' mean?",
        options: ['Yesterday', 'The day after today', 'Today', 'Next week'],
        correctOptionIndex: 1,
      },
    ],
    listening: [
      {
        questionText:
          "You hear: 'Hello! How are you?' What is the best response?",
        options: [
          "I'm fine, thanks. And you?",
          'Goodbye.',
          'My name is John.',
          'I am 25 years old.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText: "You hear: 'What time is it?' What is the best response?",
        options: ["It's 3 pm.", "I'm fine.", 'Yes, please.', 'Tomorrow.'],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Do you like coffee?' What is the best response?",
        options: [
          "Yes, I do. / No, I don't.",
          'I am a student.',
          'See you later.',
          'It is red.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Where do you live?' What is the best response?",
        options: [
          'I live in London.',
          'I am 20.',
          'Nice to meet you.',
          'I like music.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Thank you very much.' What is the best response?",
        options: ["You're welcome.", 'Hello.', "I don't know.", 'Yes, it is.'],
        correctOptionIndex: 0,
      },
    ],
  },
  A2: {
    reading_comprehension: [
      {
        questionText:
          'Read: "Last weekend I went to the cinema with my friend. We watched a comedy. It was very funny." What did they watch?',
        options: ['A comedy', 'A drama', 'A documentary', 'The news'],
        correctOptionIndex: 0,
      },
      {
        questionText:
          'Read: "My brother is learning to drive. He has lessons twice a week. He wants to buy a car next year." How often does he have lessons?',
        options: ['Once a week', 'Twice a week', 'Every day', 'Once a month'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The train was late because of the snow. We waited for one hour on the platform." Why was the train late?',
        options: ['An accident', 'The snow', 'Too many people', 'A strike'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "I have never been to Japan, but I would like to go. I am interested in the food and the temples." What does the person want to do?',
        options: [
          'Eat Japanese food at home',
          'Visit Japan',
          'Study Japanese only',
          'Work in Japan',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "She turned off the light and went to bed at 11 o\'clock. She was very tired." What did she do first?',
        options: [
          'Went to bed',
          'Turned off the light',
          'Got up',
          'Had breakfast',
        ],
        correctOptionIndex: 1,
      },
    ],
    vocabulary: [
      {
        questionText:
          "What does 'recently' mean in: I recently started a new job?",
        options: ['A long time ago', 'A short time ago', 'Never', 'Always'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          "Choose the best meaning of 'borrow': Can I borrow your pen?",
        options: ['Buy', 'Use for a while then return', 'Break', 'Lose'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'miss' mean in: I miss my family?",
        options: ['Forget', 'Feel sad because they are far', 'Call', 'Visit'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What is a 'journey'?",
        options: [
          'A place',
          'A person',
          'Travel from one place to another',
          'A meal',
        ],
        correctOptionIndex: 2,
      },
      {
        questionText: "What does 'perhaps' mean?",
        options: ['Never', 'Always', 'Maybe', 'Certainly'],
        correctOptionIndex: 2,
      },
    ],
    listening: [
      {
        questionText:
          "You hear: 'Could you pass the salt, please?' What is the best response?",
        options: [
          'Here you are.',
          "I don't like salt.",
          'The salt is on the table.',
          'No, thank you.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'How was your holiday?' What is the best response?",
        options: [
          'It was great, thanks.',
          'Next week.',
          'By plane.',
          'With my family.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Would you like something to drink?' What is the best response?",
        options: [
          'Yes, please. A coffee.',
          'I am not thirsty.',
          'I have a car.',
          'At 5 pm.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'I am sorry I am late.' What is the best response?",
        options: [
          "That's okay. Don't worry.",
          'You are welcome.',
          'I am late too.',
          'Goodbye.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'What did you do at the weekend?' What is the best response?",
        options: [
          'I went to the beach.',
          'I will go tomorrow.',
          'I like weekends.',
          'Yes, I did.',
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  B1: {
    reading_comprehension: [
      {
        questionText:
          'Read: "Although the meeting was scheduled for 3 pm, several participants arrived late due to traffic. The chairperson decided to start anyway." Why did some people arrive late?',
        options: [
          'The meeting was early',
          'Traffic',
          'The chairperson',
          'The schedule',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The report suggests that working from home can increase productivity, but only when employees have a dedicated space and clear boundaries." What does the report say about productivity?',
        options: [
          'It always increases at home',
          'It can increase at home in the right conditions',
          'It always decreases at home',
          'It is not related to where you work',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "Unlike his predecessor, the new manager prefers to make decisions after consulting the team. This has led to more support but sometimes slower outcomes." How does the new manager differ?',
        options: [
          'He decides alone',
          'He consults the team before deciding',
          'He prefers slow outcomes',
          'He has no predecessor',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The policy was introduced in 2019 and has been revised twice since then. The latest version will come into effect next month." When will the latest version start?',
        options: ['In 2019', 'Already', 'Next month', 'Twice'],
        correctOptionIndex: 2,
      },
      {
        questionText:
          'Read: "Despite the negative reviews, the film attracted large audiences in its first week. Critics praised the acting but criticised the plot." What did critics like?',
        options: ['The plot', 'The reviews', 'The acting', 'The audience'],
        correctOptionIndex: 2,
      },
    ],
    vocabulary: [
      {
        questionText:
          "What does 'significant' mean in: There was a significant increase in sales?",
        options: ['Small', 'Important or large', 'No', 'Slow'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          "Choose the best meaning of 'approach' (noun): We need a new approach to this problem.",
        options: [
          'A person',
          'A way of dealing with something',
          'A place',
          'A time',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'require' mean?",
        options: ['Refuse', 'Need', 'Offer', 'Suggest'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What is the meaning of 'approximately'?",
        options: ['Exactly', 'Roughly or about', 'Never', 'Always'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          "What does 'consider' mean in: We need to consider all options?",
        options: ['Forget', 'Think about', 'Reject', 'Finish'],
        correctOptionIndex: 1,
      },
    ],
    listening: [
      {
        questionText:
          "You hear: 'I am afraid I cannot attend the meeting tomorrow.' What is the best response?",
        options: [
          "That's a pity. We will send you the notes.",
          'The meeting is tomorrow.',
          'I am afraid too.',
          'You must attend.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Could you possibly finish the report by Friday?' What is the best response?",
        options: [
          'Yes, I should be able to.',
          'The report is long.',
          'Friday is a holiday.',
          "I don't like reports.",
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'What is your opinion on the new policy?' What is the best response?",
        options: [
          'I think it is a good idea, but we need to check the details.',
          'I have no policy.',
          'The policy is new.',
          'Yes, I do.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Would you mind if I opened the window?' What is the best response?",
        options: [
          'Not at all. Go ahead.',
          'The window is open.',
          "I don't like windows.",
          'Yes, I would.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'I have not seen you for ages. How have you been?' What is the best response?",
        options: [
          'I have been busy, but I am well, thanks.',
          'I am 30 years old.',
          'I live here.',
          'Yes, I have.',
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  B2: {
    reading_comprehension: [
      {
        questionText:
          'Read: "The proposal was met with scepticism by the board, who questioned both the projected costs and the timeline. Nevertheless, the CEO argued that the long-term benefits would outweigh the initial investment." What was the board\'s reaction?',
        options: [
          'Full support',
          'Doubt or scepticism',
          'Agreement with the CEO',
          'No reaction',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "Studies have shown a correlation between regular exercise and mental health, though causation is harder to establish. Most experts recommend at least 150 minutes per week." What do experts recommend?',
        options: [
          'Proving causation',
          'At least 150 minutes of exercise per week',
          'No exercise',
          'Only mental health checks',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The amendment was passed by a narrow margin after a lengthy debate. Opponents claimed it would undermine existing agreements, while supporters stressed the need for flexibility." How was the amendment passed?',
        options: [
          'Unanimously',
          'By a small majority',
          'Without debate',
          'By opponents',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "While the initial results were promising, the follow-up research revealed several limitations. The authors conclude that further investigation is needed before drawing firm conclusions." What do the authors recommend?',
        options: [
          'Drawing firm conclusions now',
          'More research before concluding',
          'Ignoring limitations',
          'Stopping the research',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The contract stipulates that either party may terminate the agreement with 30 days\' written notice. Failure to provide notice may result in penalties." What can happen if notice is not given?',
        options: [
          'Nothing',
          'Penalties',
          'Automatic renewal',
          'Immediate termination',
        ],
        correctOptionIndex: 1,
      },
    ],
    vocabulary: [
      {
        questionText:
          "What does 'stipulate' mean in: The contract stipulates a 30-day notice?",
        options: ['Ignores', 'States or requires', 'Suggests', 'Denies'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          "Choose the best meaning of 'undermine': The scandal could undermine public trust.",
        options: ['Increase', 'Weaken', 'Prove', 'Ignore'],
        correctOptionIndex: 1,
      },
      {
        questionText:
          "What does 'margin' mean in: The company's profit margin increased?",
        options: [
          'Edge',
          'Difference or ratio (e.g. profit per unit)',
          'Time',
          'Place',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText: "What is 'scepticism'?",
        options: ['Belief', 'Doubt or disbelief', 'Proof', 'Agreement'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'outweigh' mean?",
        options: [
          'Weigh less than',
          'Be heavier than; exceed in value',
          'Equal',
          'Ignore',
        ],
        correctOptionIndex: 1,
      },
    ],
    listening: [
      {
        questionText:
          "You hear: 'I was wondering if you had had a chance to look at the document I sent.' What is the best response?",
        options: [
          'Yes, I have. I will send you my feedback by the end of the day.',
          "I don't like documents.",
          'The document is long.',
          'I sent it yesterday.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'We need to take into account a number of factors before we proceed.' What is the best response?",
        options: [
          "I agree. Let's review them in the next meeting.",
          'We have no factors.',
          "Let's proceed now.",
          "I don't know.",
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'Could you elaborate on that point?' What is the best response?",
        options: [
          'Certainly. What I meant was that we should consider the long-term impact.',
          'The point is clear.',
          'I have no point.',
          'Yes, I could.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'I am not entirely convinced by that argument.' What is the best response?",
        options: [
          'I understand. Let me provide more evidence.',
          'You must be convinced.',
          'The argument is good.',
          'I am convinced.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'It might be worth exploring other options before we commit.' What is the best response?",
        options: [
          'Good idea. I will look into alternatives and report back.',
          'We have no options.',
          'We must commit today.',
          "I don't want to explore.",
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  C1: {
    reading_comprehension: [
      {
        questionText:
          'Read: "The prevailing view among economists is that the measure will have a negligible impact on inflation in the short term, whereas the long-term effects remain a matter of conjecture." What is said about long-term effects?',
        options: [
          'They are certain',
          'They are negligible',
          'They are uncertain or speculative',
          'They are short term',
        ],
        correctOptionIndex: 2,
      },
      {
        questionText:
          'Read: "Critics have accused the legislation of paying lip service to environmental concerns while favouring industry. The government has rejected such claims as misrepresentations." What do critics say?',
        options: [
          'The law strongly protects the environment',
          'The law only appears to address the environment',
          'The government agrees with critics',
          'Industry is against the law',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The findings are consistent with earlier hypotheses but run counter to the conclusions of the 2020 study, which had been widely cited." How do the new findings relate to the 2020 study?',
        options: [
          'They support it',
          'They contradict it',
          'They ignore it',
          'They cite it',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "Implementation has been hampered by a lack of clarity over responsibilities and by competing priorities. A review is scheduled for next quarter." What has made implementation difficult?',
        options: [
          'The review',
          'Unclear responsibilities and competing priorities',
          'Next quarter',
          'Lack of review',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "Whereas the previous framework emphasised compliance, the revised one purports to encourage innovation within certain boundaries." What does the revised framework claim to do?',
        options: [
          'Only ensure compliance',
          'Encourage innovation within limits',
          'Remove all boundaries',
          'Replace the previous framework entirely',
        ],
        correctOptionIndex: 1,
      },
    ],
    vocabulary: [
      {
        questionText: "What does 'negligible' mean?",
        options: [
          'Very large',
          'Very small or unimportant',
          'Negative',
          'Positive',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          "What does 'purport' mean in: The document purports to explain the changes?",
        options: ['Refuses', 'Claims or pretends', 'Hides', 'Forgets'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What is 'conjecture'?",
        options: ['Fact', 'Guess or speculation', 'Proof', 'Rule'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'hamper' mean?",
        options: ['Help', 'Hinder or obstruct', 'Speed up', 'Ignore'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'pay lip service' mean?",
        options: [
          'Pay money',
          'Say you support something without really doing much',
          'Refuse to speak',
          'Support fully',
        ],
        correctOptionIndex: 1,
      },
    ],
    listening: [
      {
        questionText:
          "You hear: 'I take your point, but I would argue that we need to look at the broader picture.' What is the best response?",
        options: [
          "I see what you mean. Let's consider both the details and the overall strategy.",
          'The picture is broad.',
          "I don't take your point.",
          'We have no picture.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'It is imperative that we reach a decision by the end of the week.' What is the best response?",
        options: [
          'Understood. I will have my input ready by then.',
          'We have no decision.',
          'The week is long.',
          "I don't think so.",
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'The proposal is not without merit, but there are significant drawbacks.' What is the best response?",
        options: [
          'Could you outline the main drawbacks so we can address them?',
          'There are no drawbacks.',
          'The proposal is bad.',
          'I agree completely.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'We need to strike a balance between cost and quality.' What is the best response?",
        options: [
          "Agreed. Let's identify where we can compromise without sacrificing standards.",
          'Cost is more important.',
          'Quality does not matter.',
          'We cannot balance.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'That seems to be at odds with what we agreed last month.' What is the best response?",
        options: [
          'You are right. Let me check the minutes and realign with the agreement.',
          'We agreed nothing.',
          'Last month is past.',
          'I disagree with everything.',
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  C2: {
    reading_comprehension: [
      {
        questionText:
          'Read: "The author takes issue with the conflation of correlation and causation that has characterised much of the public debate, and calls for a more nuanced reading of the data." What does the author criticise?',
        options: [
          'Nuanced reading',
          'Treating correlation as if it were causation',
          'The data itself',
          'Public debate in general',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "Whilst the initiative has been lauded in some quarters, it has drawn flak from those who see it as an unwarranted encroachment on local autonomy." What has the initiative received?',
        options: [
          'Only praise',
          'Both praise and criticism',
          'Only local support',
          'No attention',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The ruling is likely to have far-reaching implications, not least for how similar cases are argued in future. Commentators are divided over whether it sets a welcome precedent." What are commentators divided about?',
        options: [
          'The ruling itself',
          'Whether it is a good precedent',
          'Future cases only',
          'The implications',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The text is deliberately equivocal, leaving room for multiple interpretations. Scholars have long debated whether this reflects the author\'s uncertainty or a rhetorical strategy." What is said about the text?',
        options: [
          'It has one clear meaning',
          'It is intentionally ambiguous',
          'Scholars agree about it',
          'It reflects no strategy',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText:
          'Read: "The policy was rescinded in the face of mounting criticism and after it emerged that key assumptions had been flawed. A successor framework is still in the pipeline." What happened to the policy?',
        options: [
          'It was strengthened',
          'It was withdrawn or cancelled',
          'It was mounted',
          'It was flawed only in theory',
        ],
        correctOptionIndex: 1,
      },
    ],
    vocabulary: [
      {
        questionText: "What does 'conflation' mean?",
        options: [
          'Separation',
          'Merging or confusing two things',
          'Conclusion',
          'Clarification',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'rescind' mean?",
        options: ['Enforce', 'Cancel or revoke', 'Support', 'Extend'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'equivocal' mean?",
        options: ['Clear', 'Ambiguous or unclear', 'Equal', 'Spoken'],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'draw flak' mean?",
        options: [
          'Receive praise',
          'Receive criticism',
          'Avoid attention',
          'Support',
        ],
        correctOptionIndex: 1,
      },
      {
        questionText: "What does 'in the pipeline' mean?",
        options: [
          'Finished',
          'Being prepared or planned',
          'In the past',
          'Cancelled',
        ],
        correctOptionIndex: 1,
      },
    ],
    listening: [
      {
        questionText:
          "You hear: 'I would stop short of saying it is inevitable, but the trend is unmistakable.' What is the best response?",
        options: [
          'I see. So you see it as very likely but not certain.',
          'It is inevitable.',
          'The trend is short.',
          "I don't understand trends.",
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'We need to guard against the assumption that one size fits all.' What is the best response?",
        options: [
          'Agreed. We should tailor the approach to each context.',
          'One size does fit all.',
          'We have no assumptions.',
          'We need more sizes.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'That interpretation is not entirely without foundation, but it is open to challenge.' What is the best response?",
        options: [
          "Fair point. Let's see what counterarguments we can anticipate.",
          'It has no foundation.',
          'We cannot challenge it.',
          'I agree entirely.',
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'The figures are provisional and should be treated with a degree of caution.' What is the best response?",
        options: [
          'Understood. I will not treat them as final until they are confirmed.',
          'The figures are final.',
          'We need no caution.',
          "I don't like figures.",
        ],
        correctOptionIndex: 0,
      },
      {
        questionText:
          "You hear: 'It behoves us to consider the ethical dimensions before we proceed.' What is the best response?",
        options: [
          'I agree. We should assess the ethical implications first.',
          'Ethics are not important.',
          'We have already proceeded.',
          "I don't know what behoves means.",
        ],
        correctOptionIndex: 0,
      },
    ],
  },
};
