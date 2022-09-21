export const expiredAccess = '100000s';
export const expiredRefresh = '200000s';
export const quizQuestions = [
  { body: 'Do you like JS?', correctAnswer: 'yes' },
  { body: 'Do you like TS?', correctAnswer: 'yes' },
  { body: 'Do you like Jest?', correctAnswer: 'yes' },
  { body: 'Do you like Java?', correctAnswer: 'yes' },
  { body: 'Do you like React?', correctAnswer: 'yes' },
  { body: 'Do you like Vue?', correctAnswer: 'yes' },
  { body: 'Do you like Next', correctAnswer: 'yes' },
  { body: 'Do you like Nuxt?', correctAnswer: 'yes' },
  { body: 'Do you like CSS?', correctAnswer: 'yes' },
  { body: 'Do you like HTML?', correctAnswer: 'yes' },
  { body: 'Do you like MUI?', correctAnswer: 'yes' },
];
export let countQuestions: number;
export let decideTimeAnswer: number;
if (process.env.NODE_ENV === 'test') {
  countQuestions = 3;
  decideTimeAnswer = 1;
} else {
  countQuestions = 5;
  decideTimeAnswer = 60000;
}
