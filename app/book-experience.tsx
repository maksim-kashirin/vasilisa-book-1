'use client';

import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  Home,
  Lightbulb,
  Palette,
  Pencil,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type Companion = 'horse' | 'unicorn' | null;
type BookId = 'suteev' | 'chukovsky' | 'patrol' | 'deniska' | null;

const TOTAL_SCENES = 24;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const sceneTitles = [
  'Обложка',
  'Здесь можно пробовать',
  'Выбор спутника',
  'Тайна долины',
  'Твои умения',
  'Зачем читать',
  'Три языка',
  'Серебряный след',
  'Первый вопрос',
  'Когда ответ не приходит',
  'Волшебное слово',
  'Фонарик читателя',
  'Ищем подсказку',
  'Вторая загадка',
  'Дверь библиотеки',
  'Слова оживают',
  'Задания Меги',
  'Пятнадцать минут',
  'Книжная полка за год',
  'Полка Василисы',
  'Читать можно по-разному',
  'Команда помощников',
  'Семь серебряных следов',
  'Исследовательница историй',
];

const homeBooks = [
  { id: 'suteev' as const, title: 'Сказки', author: 'Владимир Сутеев', note: 'Короткие истории и много понятных картинок', icon: '🐥', color: 'book-coral' },
  { id: 'chukovsky' as const, title: 'Сказки', author: 'Корней Чуковский', note: 'Ритм, рифмы и удивительные слова', icon: '🪰', color: 'book-gold' },
  { id: 'patrol' as const, title: 'Щенячий патруль', author: 'Книга о знакомых героях', note: 'Легче понимать, когда герои уже знакомы', icon: '🐾', color: 'book-blue' },
  { id: 'deniska' as const, title: 'Денискины рассказы', author: 'Виктор Драгунский', note: 'Можно читать с папой по одному рассказу', icon: '🚲', color: 'book-violet' },
];

const readingModes = [
  { id: 'self', icon: '📖', title: 'Сама', note: 'Я выбираю короткий кусочек' },
  { id: 'turns', icon: '🤝', title: 'По очереди', note: 'Страница папы, страница моя' },
  { id: 'roles', icon: '🎭', title: 'По ролям', note: 'У каждого героя свой голос' },
  { id: 'listen', icon: '🎧', title: 'Сначала слушаю', note: 'Потом читаю глазами' },
  { id: 'draw', icon: '🎨', title: 'Читаю и рисую', note: 'Рисую любимый момент' },
];

const dictionary = [
  { word: 'калитка', meaning: 'маленькая дверь в заборе', icon: '🚪' },
  { word: 'нетерпеливо', meaning: 'когда трудно спокойно ждать', icon: '🐎' },
  { word: 'блестеть', meaning: 'отражать свет', icon: '✨' },
  { word: 'след', meaning: 'знак, который кто-то оставил', icon: '👣' },
];

function getBackground(scene: number) {
  if (scene <= 6) return `${BASE_PATH}/images/book-valley-hero.png`;
  if (scene <= 13) return `${BASE_PATH}/images/silver-trails.png`;
  return `${BASE_PATH}/images/library-awakens.png`;
}

export default function BookExperience() {
  const [scene, setScene] = useState(0);
  const [companion, setCompanion] = useState<Companion>(null);
  const [quizChoice, setQuizChoice] = useState<string | null>(null);
  const [quizSolved, setQuizSolved] = useState(false);
  const [showQuizClue, setShowQuizClue] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [pokaOpen, setPokaOpen] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [secondChoice, setSecondChoice] = useState<string | null>(null);
  const [secondSolved, setSecondSolved] = useState(false);
  const [activeWord, setActiveWord] = useState(0);
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [bookTarget, setBookTarget] = useState(52);
  const [bookChoice, setBookChoice] = useState<BookId>(null);
  const [readingMode, setReadingMode] = useState<string | null>(null);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [challengeDays, setChallengeDays] = useState(0);
  const [finished, setFinished] = useState(false);
  // Restore browser-only saved choices after the statically rendered page mounts.
  /* oxlint-disable react/react-compiler */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vasilisa-book-valley') || '{}');
      if (saved.companion === 'horse' || saved.companion === 'unicorn') setCompanion(saved.companion);
      if (homeBooks.some((book) => book.id === saved.bookChoice)) setBookChoice(saved.bookChoice);
      if (typeof saved.readingMode === 'string') setReadingMode(saved.readingMode);
      if (typeof saved.challengeAccepted === 'boolean') setChallengeAccepted(saved.challengeAccepted);
      if (typeof saved.challengeDays === 'number') setChallengeDays(Math.min(7, Math.max(0, saved.challengeDays)));
    } catch {
      // A fresh story works even if storage is unavailable.
    }
  }, []);
  /* oxlint-enable react/react-compiler */
  useEffect(() => {
    try {
      localStorage.setItem('vasilisa-book-valley', JSON.stringify({ companion, bookChoice, readingMode, challengeAccepted, challengeDays }));
    } catch {
      // Progress saving is optional.
    }
  }, [companion, bookChoice, readingMode, challengeAccepted, challengeDays]);

  const companionName = companion === 'unicorn' ? 'Лучик' : 'Звёздочка';
  const companionEmoji = companion === 'unicorn' ? '🦄' : '🐴';
  const annualHours = Math.round((dailyMinutes * 365) / 60);
  const selectedBook = homeBooks.find((book) => book.id === bookChoice);

  const canContinue = useMemo(() => {
    if (scene === 2) return Boolean(companion);
    if (scene === 8) return quizSolved;
    if (scene === 9) return Boolean(emotion);
    if (scene === 13) return secondSolved;
    if (scene === 19) return Boolean(bookChoice);
    if (scene === 20) return Boolean(readingMode);
    if (scene === 22) return challengeAccepted;
    return true;
  }, [scene, companion, quizSolved, emotion, secondSolved, bookChoice, readingMode, challengeAccepted]);

  const nextScene = useCallback(() => {
    if (!canContinue) return;
    setScene((value) => Math.min(TOTAL_SCENES - 1, value + 1));
  }, [canContinue]);

  const previousScene = useCallback(() => setScene((value) => Math.max(0, value - 1)), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') nextScene();
      if (event.key === 'ArrowLeft') previousScene();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nextScene, previousScene]);

  const speak = (text: string, lang = 'ru-RU') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  const answerFirstQuiz = (choice: string) => {
    setQuizChoice(choice);
    if (choice === 'pony') {
      setQuizSolved(true);
      setShowQuizClue(true);
    } else if (choice === 'later') {
      setShowQuizClue(true);
    }
  };

  const answerSecondQuiz = (choice: string) => {
    setSecondChoice(choice);
    if (choice === 'steps') setSecondSolved(true);
  };

  const restart = () => {
    setScene(0);
    setQuizChoice(null);
    setQuizSolved(false);
    setShowQuizClue(false);
    setEmotion(null);
    setPokaOpen(false);
    setTorchOn(false);
    setSecondChoice(null);
    setSecondSolved(false);
    setFinished(false);
  };

  const renderScene = () => {
    switch (scene) {
      case 0:
        return (
          <div className="cover-copy">
            <p className="scene-kicker"><Sparkles /> Для Василисы</p>
            <h1>Тайна<br />Книжной долины</h1>
            <p className="cover-lead">Приключение начинается с одного предложения</p>
            <Button className="gold-button" onClick={nextScene}>Открыть книгу <ArrowRight /></Button>
          </div>
        );
      case 1:
        return (
          <div className="center-copy narrow-copy">
            <p className="scene-kicker"><Sparkles /> Перед дорогой</p>
            <h2>Здесь можно пробовать</h2>
            <p className="large-copy">Можно думать, ошибаться и пробовать ещё раз. Если ответ не приходит сразу, появится подсказка.</p>
            <div className="kind-rule"><span>💛</span><p><strong>Ошибки не отнимают звёзды.</strong><br />Звёзды появляются за смелую попытку.</p></div>
          </div>
        );
      case 2:
        return (
          <div className="center-copy medium-copy">
            <p className="scene-kicker"><Sparkles /> Твой первый выбор</p>
            <h2>Кого возьмём с собой?</h2>
            <p className="scene-intro">Спутник будет рядом, если понадобится подсказка.</p>
            <div className="big-choice-grid two-columns">
              <button className={`picture-choice ${companion === 'horse' ? 'selected' : ''}`} onClick={() => setCompanion('horse')}>
                <span className="choice-emoji">🐴</span><strong>Звёздочка</strong><small>смелая лошадка</small>{companion === 'horse' && <Check />}
              </button>
              <button className={`picture-choice ${companion === 'unicorn' ? 'selected' : ''}`} onClick={() => setCompanion('unicorn')}>
                <span className="choice-emoji">🦄</span><strong>Лучик</strong><small>добрый единорог</small>{companion === 'unicorn' && <Check />}
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="left-copy text-on-dark">
            <p className="scene-kicker"><BookOpen /> Тайна долины</p>
            <h2>Из книг исчезают цвета</h2>
            <p className="large-copy">Они возвращаются, когда читатель находит спрятанный в тексте смысл.</p>
            <div className="speech-bubble"><span>{companionEmoji}</span><p><strong>{companionName}:</strong> «Василиса, нам нужна читательница, которая замечает детали».</p></div>
          </div>
        );
      case 4:
        return (
          <div className="center-copy wide-copy">
            <p className="scene-kicker"><Star /> Большая часть пути уже позади</p>
            <h2>Ты уже многое умеешь</h2>
            <div className="strength-line">
              <div><span>АБ</span><p>Читаешь целые предложения</p></div>
              <div><span>💬</span><p>Каждый день говоришь по-русски</p></div>
              <div><span>🔎</span><p>Замечаешь важные детали</p></div>
            </div>
            <p className="glow-answer">Теперь научимся собирать из предложений смысл.</p>
          </div>
        );
      case 5:
        return (
          <div className="split-copy">
            <div>
              <p className="scene-kicker"><Palette /> Слова рисуют картину</p>
              <h2>Зачем читать, если уже говоришь по-русски?</h2>
            </div>
            <div className="sentence-comparison">
              <button onClick={() => speak('Лошадка быстро бежит.')}>«Лошадка быстро бежит». <Volume2 /></button>
              <button className="richer" onClick={() => speak('Лошадка помчалась по узкой тропинке, и её грива взлетела на ветру.')}>«Лошадка помчалась по узкой тропинке, и её грива взлетела на ветру». <Volume2 /></button>
              <p>Во второй фразе воображение видит больше.</p>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="center-copy wide-copy">
            <p className="scene-kicker"><Sparkles /> Три ключа к историям</p>
            <h2>Один мир на трёх языках</h2>
            <div className="language-table">
              <button onClick={() => speak('лошадь, единорог, книга', 'ru-RU')}><small>Русский</small><strong>лошадь</strong><span>единорог · книга</span><Volume2 /></button>
              <button onClick={() => speak('Pferd, Einhorn, Buch', 'de-DE')}><small>Deutsch</small><strong>Pferd</strong><span>Einhorn · Buch</span><Volume2 /></button>
              <button onClick={() => speak('cheval, licorne, livre', 'fr-FR')}><small>Français</small><strong>cheval</strong><span>licorne · livre</span><Volume2 /></button>
            </div>
            <p className="glow-answer">Чем больше ты читаешь, тем больше историй можешь открыть сама.</p>
          </div>
        );
      case 7:
        return (
          <div className="reading-layout">
            <div className="story-card">
              <div className="story-card-top"><span>История 1</span><button onClick={() => speak('После дождя Василиса пришла к лошадке Звёздочке. Та стояла у калитки и нетерпеливо переступала с ноги на ногу. На дорожке блестели три следа: золотой, синий и серебряный. Звёздочка наклонила голову к серебряному следу. Василиса поняла, куда нужно идти.')}><Volume2 /> Послушать</button></div>
              <p>После дождя Василиса пришла к лошадке Звёздочке.</p>
              <p>Та стояла у калитки и нетерпеливо переступала с ноги на ногу.</p>
              <p>На дорожке блестели три следа: золотой, синий и серебряный.</p>
              <p>Звёздочка наклонила голову к серебряному следу.</p>
              <p>Василиса поняла, куда нужно идти.</p>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="quiz-layout">
            <p className="scene-kicker"><Search /> Первая загадка</p>
            <h2>Почему Василиса выбрала серебряный след?</h2>
            {showQuizClue && <p className="clue-line"><Lightbulb /> Подсказка спряталась в последнем предложении о Звёздочке.</p>}
            <div className="answer-stack">
              <button className={quizChoice === 'pretty' ? 'tried' : ''} onClick={() => answerFirstQuiz('pretty')}>Потому что он был самым красивым</button>
              <button className={quizChoice === 'pony' ? 'correct' : ''} onClick={() => answerFirstQuiz('pony')}>Потому что Звёздочка показала на него {quizSolved && <Check />}</button>
              <button className={quizChoice === 'gone' ? 'tried' : ''} onClick={() => answerFirstQuiz('gone')}>Потому что золотой след исчез</button>
              <button className="not-yet" onClick={() => answerFirstQuiz('later')}>Я пока не знаю</button>
            </div>
            {quizChoice && quizChoice !== 'pony' && quizChoice !== 'later' && <p className="gentle-feedback">Интересная версия. Давай найдём предложение, где Звёздочка даёт подсказку.</p>}
            {quizSolved && <p className="success-feedback"><Sparkles /> Ты нашла причину в тексте.</p>}
          </div>
        );
      case 9:
        return (
          <div className="center-copy medium-copy">
            <p className="scene-kicker"><Sparkles /> У читателей бывают разные чувства</p>
            <h2>Когда ответ не приходит сразу…</h2>
            <p className="scene-intro">Что ты иногда чувствуешь?</p>
            <div className="emotion-row">
              {[['angry','😠','Я сержусь'],['lost','😕','Я теряюсь'],['time','🤔','Мне нужно время']].map(([id, icon, label]) => (
                <button key={id} className={emotion === id ? 'selected' : ''} onClick={() => setEmotion(id)}><span>{icon}</span><strong>{label}</strong></button>
              ))}
            </div>
            {emotion && <div className="speech-bubble centered"><span>{companionEmoji}</span><p>Так бывает у всех читателей. Вопрос помогает понять, что искать.</p></div>}
          </div>
        );
      case 10:
        return (
          <div className="center-copy narrow-copy">
            <p className="scene-kicker"><Sparkles /> Маленькое слово, большая помощь</p>
            <h2>«Я <button className={`inline-magic-word ${pokaOpen ? 'visible' : ''}`} onClick={() => setPokaOpen(true)}>{pokaOpen ? 'пока ' : '+ '}</button>не знаю»</h2>
            <p className="large-copy">{pokaOpen ? 'Слово «пока» оставляет дверь открытой. Можно найти подсказку и попробовать ещё раз.' : 'Нажми на плюс и добавь одно волшебное слово.'}</p>
            <div className={`magic-door ${pokaOpen ? 'open' : ''}`}><span>✦</span></div>
          </div>
        );
      case 11:
        return (
          <div className="center-copy wide-copy">
            <p className="scene-kicker"><Lightbulb /> Новый инструмент</p>
            <h2>Фонарик читателя</h2>
            <div className="torch-steps">
              <div><b>1</b><span><strong>Что спрашивают?</strong><small>Кто, где, что или почему?</small></span></div>
              <div><b>2</b><span><strong>Где подсказка?</strong><small>Иногда хватит одного предложения.</small></span></div>
              <div><b>3</b><span><strong>Что значат слова рядом?</strong><small>Они помогают связать события.</small></span></div>
              <div><b>4</b><span><strong>Как сказать своими словами?</strong><small>Короткий ответ тоже подходит.</small></span></div>
            </div>
          </div>
        );
      case 12:
        return (
          <div className="guided-layout">
            <div>
              <p className="scene-kicker"><Search /> Фонарик в работе</p>
              <h2><span className={torchOn ? 'question-word' : ''}>Почему</span> Василиса выбрала серебряный след?</h2>
              <button className="torch-button" onClick={() => setTorchOn(true)}><Lightbulb /> Включить фонарик</button>
            </div>
            <div className={`evidence-card ${torchOn ? 'lit' : ''}`}>
              <p>На дорожке блестели три следа.</p>
              <p className="evidence">Звёздочка наклонила голову к серебряному следу.</p>
              <p>Василиса поняла, куда нужно идти.</p>
              {torchOn && <div className="assembled-answer"><Check /> Василиса выбрала серебряный след, потому что Звёздочка показала на него.</div>}
            </div>
          </div>
        );
      case 13:
        return (
          <div className="quiz-layout">
            <p className="scene-kicker"><Search /> Вторая загадка</p>
            <h2>Какие слова показывают, что Звёздочка торопилась?</h2>
            <div className="answer-stack phrase-answers">
              <button className={secondChoice === 'rain' ? 'tried' : ''} onClick={() => answerSecondQuiz('rain')}>«После дождя»</button>
              <button className={secondChoice === 'steps' ? 'correct' : ''} onClick={() => answerSecondQuiz('steps')}>«Нетерпеливо переступала с ноги на ногу» {secondSolved && <Check />}</button>
              <button className={secondChoice === 'silver' ? 'tried' : ''} onClick={() => answerSecondQuiz('silver')}>«Серебряный след»</button>
            </div>
            {secondChoice && secondChoice !== 'steps' && <p className="gentle-feedback">Хорошая попытка. Ищем слова, которые показывают движение Звёздочки.</p>}
            {secondSolved && <p className="success-feedback"><Sparkles /> Ты поняла чувство героя по его движению.</p>}
          </div>
        );
      case 14:
        return (
          <div className="left-copy text-on-dark library-copy">
            <p className="scene-kicker"><BookOpen /> Дверь открыта</p>
            <h2>Цвета возвращаются</h2>
            <p className="large-copy">Ты прочитала слова, нашла подсказки и поняла смысл.</p>
            <div className="reward-stars"><span>✦</span><span>✦</span><span>✦</span></div>
          </div>
        );
      case 15:
        return (
          <div className="dictionary-layout">
            <div>
              <p className="scene-kicker"><BookOpen /> Новые слова</p>
              <h2>Слова оживают</h2>
              <p className="scene-intro">Нажми на слово и открой его смысл.</p>
              <div className="word-tabs">
                {dictionary.map((item, index) => <button key={item.word} className={activeWord === index ? 'selected' : ''} onClick={() => setActiveWord(index)}>{item.word}</button>)}
              </div>
            </div>
            <div className="word-reveal"><span>{dictionary[activeWord].icon}</span><strong>{dictionary[activeWord].word}</strong><p>{dictionary[activeWord].meaning}</p><button onClick={() => speak(`${dictionary[activeWord].word}. ${dictionary[activeWord].meaning}`)}><Volume2 /> Послушать</button></div>
          </div>
        );
      case 16:
        return (
          <div className="center-copy wide-copy">
            <p className="scene-kicker"><Pencil /> Уроки с Меги</p>
            <h2>Знакомый путь легче начать</h2>
            <div className="megi-path">
              <div><span>1</span><strong>Прочитать вопрос</strong><small>Что нужно найти?</small></div>
              <div><span>2</span><strong>Найти нужное место</strong><small>Не весь текст, а подсказку.</small></div>
              <div><span>3</span><strong>Ответить своими словами</strong><small>Можно начать с одного слова.</small></div>
            </div>
            <p className="glow-answer">Если тренировать эти шаги дома, на уроке легче понять, с чего начать.</p>
          </div>
        );
      case 17:
        return (
          <div className="time-layout">
            <div>
              <p className="scene-kicker"><Clock /> Маленькое время, большой результат</p>
              <h2>Каждый день по чуть-чуть</h2>
              <div className="minute-switch"><button className={dailyMinutes === 15 ? 'selected' : ''} onClick={() => setDailyMinutes(15)}>15 минут</button><button className={dailyMinutes === 20 ? 'selected' : ''} onClick={() => setDailyMinutes(20)}>20 минут</button></div>
            </div>
            <div className="time-number"><strong>{annualHours}</strong><span>часов чтения за год</span><small>если читать каждый день</small></div>
            <div className="time-note">365 маленьких встреч с историями. Скорость не важна. Важны интерес и понимание.</div>
          </div>
        );
      case 18:
        return (
          <div className="center-copy wide-copy">
            <p className="scene-kicker"><BookOpen /> Волшебная математика</p>
            <h2>Сколько книг может появиться на полке?</h2>
            <div className="book-target-options">
              {[{n:12,l:'1 в месяц'},{n:24,l:'2 в месяц'},{n:52,l:'1 в неделю'},{n:104,l:'2 в неделю'}].map((item) => <button key={item.n} className={bookTarget === item.n ? 'selected' : ''} onClick={() => setBookTarget(item.n)}><strong>{item.n}</strong><span>{item.l}</span></button>)}
            </div>
            <div className="shelf-meter"><div className="shelf-books">{Array.from({length: Math.min(26, Math.ceil(bookTarget / 4))}).map((_,i)=><i key={i} style={{height: `${36 + (i % 4) * 7}px`}} />)}</div><div className="shelf-board" /></div>
            <p className="gentle-note">Книги бывают разной длины. Это пример, а не обязательный результат.</p>
          </div>
        );
      case 19:
        return (
          <div className="books-layout">
            <div className="books-heading"><p className="scene-kicker"><BookOpen /> Книги уже ждут дома</p><h2>С чего хочется начать?</h2></div>
            <div className="home-books-grid">
              {homeBooks.map((book) => (
                <button key={book.id} className={`home-book ${book.color} ${bookChoice === book.id ? 'selected' : ''}`} onClick={() => setBookChoice(book.id)}>
                  <span className="book-icon">{book.icon}</span><small>{book.author}</small><strong>{book.title}</strong><p>{book.note}</p>{bookChoice === book.id && <span className="chosen-mark"><Check /> Выбрано</span>}
                </button>
              ))}
            </div>
          </div>
        );
      case 20:
        return (
          <div className="center-copy wide-copy">
            <p className="scene-kicker"><Sparkles /> У чтения много способов</p>
            <h2>Сегодня я хочу читать…</h2>
            <div className="mode-grid">
              {readingModes.map((mode) => <button key={mode.id} className={readingMode === mode.id ? 'selected' : ''} onClick={() => setReadingMode(mode.id)}><span>{mode.icon}</span><strong>{mode.title}</strong><small>{mode.note}</small>{readingMode === mode.id && <Check />}</button>)}
            </div>
            <p className="glow-answer">Завтра можно выбрать другой способ.</p>
          </div>
        );
      case 21:
        return (
          <div className="helpers-layout">
            <div><p className="scene-kicker"><Sparkles /> Команда Василисы</p><h2>Помощники рядом</h2></div>
            <div className="helper-lines">
              <div><span>👨</span><p><strong>Папа</strong> читает первую страницу, а Василиса следующую.</p></div>
              <div><span>🔊</span><p><strong>Алиса</strong> помогает послушать отрывок, новое слово или сказку.</p></div>
              <div><span>✏️</span><p><strong>Меги</strong> показывает новый читательский приём.</p></div>
              <div className="hero-helper"><span>{companionEmoji}</span><p><strong>{companionName}</strong> напоминает: «Ответ умеешь находить ты».</p></div>
            </div>
          </div>
        );
      case 22:
        return (
          <div className="challenge-layout">
            <div>
              <p className="scene-kicker"><CalendarDays /> Первый маршрут</p>
              <h2>Семь серебряных следов</h2>
              <p className="scene-intro">15–20 минут чтения в день. Если день пропустился, путь продолжается завтра.</p>
              {!challengeAccepted ? <Button className="gold-button" onClick={() => setChallengeAccepted(true)}>Я попробую 7 дней <Sparkles /></Button> : <div className="accepted-note"><Check /> Маршрут принят</div>}
            </div>
            <div className="day-path">
              {Array.from({ length: 7 }).map((_, index) => <div key={index} className={index < challengeDays ? 'done' : index === challengeDays ? 'today' : ''}><span>{index < challengeDays ? '★' : '♞'}</span><small>день {index + 1}</small></div>)}
            </div>
            {challengeAccepted && challengeDays < 7 && <button className="today-button" onClick={() => setChallengeDays((value) => Math.min(7, value + 1))}><BookOpen /> Сегодня я читала</button>}
            {challengeDays === 7 && <p className="success-feedback"><Sparkles /> Семь следов сияют. Ты завершила первый маршрут!</p>}
          </div>
        );
      case 23:
        return (
          <div className="finale-layout">
            {!finished ? (
              <>
                <p className="scene-kicker"><Sparkles /> Книжная долина снова сияет</p>
                <h2>Василиса,<br />ты умеешь находить смысл</h2>
                <p>Каждая прочитанная история делает следующую немного легче.</p>
                <div className="certificate"><span>{companionEmoji}</span><small>Диплом</small><strong>Исследовательница<br />Книжной долины</strong><p>Нашла подсказки и открыла первую книжную дверь</p></div>
                <Button className="gold-button" onClick={() => setFinished(true)}>Начать сегодня <Star /></Button>
              </>
            ) : (
              <div className="celebration">
                <div className="celebration-stars">✦ ★ ✦ ★ ✦</div>
                <span className="big-emoji">{companionEmoji}</span>
                <h2>Первая книга выбрана!</h2>
                <p><strong>{selectedBook?.title || 'Любимая книга'}</strong><br />15–20 минут. Папа и {companionName} рядом.</p>
                <Button className="soft-button" onClick={restart}><RotateCcw /> Пройти приключение ещё раз</Button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const background = getBackground(scene);
  const stageStyle = { '--scene-image': `url(${background})` } as CSSProperties;

  return (
    <main className="storybook-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className={`presentation-stage scene-${scene}`} style={stageStyle} aria-label={`${scene + 1}. ${sceneTitles[scene]}`}>
        <div className="stage-image" />
        <div className="stage-shade" />
        <div className="spark-field" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>

        <header className="stage-header">
          <button className="home-button" onClick={() => setScene(0)} aria-label="Вернуться в начало"><BookOpen /></button>
          <div className="chapter-track" aria-label={`Сцена ${scene + 1} из ${TOTAL_SCENES}`}>
            <div className="chapter-progress" style={{ width: `${((scene + 1) / TOTAL_SCENES) * 100}%` }} />
          </div>
          <span className="scene-number">{String(scene + 1).padStart(2, '0')} / {TOTAL_SCENES}</span>
          {companion && scene > 2 && <span className="companion-badge">{companionEmoji} {companionName}</span>}
        </header>

        <div className="scene-content" key={scene}>{renderScene()}</div>

        {scene > 0 && scene < 23 && (
          <nav className="stage-nav" aria-label="Навигация по истории">
            <Button className="nav-button back" variant="outline" onClick={previousScene}><ArrowLeft /> Назад</Button>
            <span className="scene-name">{sceneTitles[scene]}</span>
            <Button className="nav-button next" onClick={nextScene} disabled={!canContinue}>Дальше <ArrowRight /></Button>
          </nav>
        )}

        {scene === 23 && <button className="corner-home" onClick={() => setScene(0)} aria-label="В начало"><Home /></button>}
      </section>

      <p className="keyboard-hint">Можно использовать клавиши ← и →</p>
    </main>
  );
}
