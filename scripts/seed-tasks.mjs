import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const TASKS = [
  // ─── Алгебра - Лёгкий ─────────────────────────────────────────────────────
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Числа", text: "Найдите значение выражения: 2³ · 2⁻¹", answer: "4", solution: "2³ · 2⁻¹ = 2^(3-1) = 2² = 4" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Уравнения", text: "Решите уравнение: 3x - 9 = 0", answer: "3", solution: "3x = 9, x = 3" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Числа", text: "Вычислите: √144", answer: "12", solution: "√144 = 12, так как 12² = 144" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Прогрессии", text: "Найдите 10-й член арифметической прогрессии: a₁ = 2, d = 3", answer: "29", solution: "a₁₀ = a₁ + (10-1)·d = 2 + 9·3 = 2 + 27 = 29" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Числа", text: "Упростите: (a²b)³", answer: "a⁶b³", solution: "(a²b)³ = a^(2·3) · b³ = a⁶b³" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Уравнения", text: "Решите: |x - 3| = 5", answer: "x = 8 или x = -2", solution: "x - 3 = 5 → x = 8; x - 3 = -5 → x = -2" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Логарифмы", text: "Найдите: log₂ 8", answer: "3", solution: "log₂ 8 = log₂ 2³ = 3" },
  { subject: "math", topic: "Алгебра", difficulty: "easy", category: "Числа", text: "Вычислите: 0.001^(1/3)", answer: "0.1", solution: "0.001^(1/3) = (10⁻³)^(1/3) = 10⁻¹ = 0.1" },

  // ─── Алгебра - Средний ────────────────────────────────────────────────────
  { subject: "math", topic: "Алгебра", difficulty: "medium", category: "Уравнения", text: "Решите уравнение: x² - 5x + 6 = 0", answer: "x = 2; x = 3", solution: "D = 25 - 24 = 1. x = (5 ± 1)/2. x₁ = 3, x₂ = 2" },
  { subject: "math", topic: "Алгебра", difficulty: "medium", category: "Неравенства", text: "Решите неравенство: x² - 4 > 0", answer: "x < -2 или x > 2", solution: "(x-2)(x+2) > 0. Знак + при x < -2 и x > 2" },
  { subject: "math", topic: "Алгебра", difficulty: "medium", category: "Логарифмы", text: "Решите уравнение: log₃(x+1) = 2", answer: "x = 8", solution: "x + 1 = 3² = 9, x = 8" },
  { subject: "math", topic: "Алгебра", difficulty: "medium", category: "Показательные", text: "Решите: 2^(x+1) = 16", answer: "x = 3", solution: "2^(x+1) = 2⁴, x+1 = 4, x = 3" },
  { subject: "math", topic: "Алгебра", difficulty: "medium", category: "Прогрессии", text: "Сумма первых n членов арифметической прогрессии равна n² + 2n. Найдите a₅.", answer: "11", solution: "S₅ = 25 + 10 = 35; S₄ = 16 + 8 = 24; a₅ = S₅ - S₄ = 11" },
  { subject: "math", topic: "Алгебра", difficulty: "medium", category: "Дроби", text: "Найдите область определения: f(x) = √(4 - x²)", answer: "-2 ≤ x ≤ 2", solution: "4 - x² ≥ 0, x² ≤ 4, |x| ≤ 2, x ∈ [-2; 2]" },

  // ─── Алгебра - Сложный ────────────────────────────────────────────────────
  { subject: "math", topic: "Алгебра", difficulty: "hard", category: "Логарифмы", text: "Решите уравнение: log₂(x-1) + log₂(x+1) = 3", answer: "x = 3", solution: "log₂((x-1)(x+1)) = 3, (x-1)(x+1) = 8, x²-1 = 8, x² = 9, x = ±3. ОДЗ: x > 1, x = 3" },
  { subject: "math", topic: "Алгебра", difficulty: "hard", category: "Неравенства", text: "Решите систему: {x + y = 5; x² + y² = 13}", answer: "x=2,y=3 или x=3,y=2", solution: "y = 5-x. x² + (5-x)² = 13. 2x² - 10x + 12 = 0. x² - 5x + 6 = 0. x = 2 или x = 3" },
  { subject: "math", topic: "Алгебра", difficulty: "hard", category: "Показательные", text: "Решите: 4^x - 3·2^x - 4 = 0", answer: "x = 2", solution: "Пусть t = 2^x > 0. t² - 3t - 4 = 0. (t-4)(t+1) = 0. t = 4 (т.к. t > 0). 2^x = 4 = 2², x = 2" },

  // ─── Геометрия - Лёгкий ──────────────────────────────────────────────────
  { subject: "math", topic: "Геометрия", difficulty: "easy", category: "Планиметрия", text: "Найдите площадь прямоугольника со сторонами 5 и 8.", answer: "40", solution: "S = a · b = 5 · 8 = 40" },
  { subject: "math", topic: "Геометрия", difficulty: "easy", category: "Планиметрия", text: "В прямоугольном треугольнике катеты равны 3 и 4. Найдите гипотенузу.", answer: "5", solution: "c = √(3² + 4²) = √(9 + 16) = √25 = 5" },
  { subject: "math", topic: "Геометрия", difficulty: "easy", category: "Окружность", text: "Найдите длину окружности радиуса 7.", answer: "14π", solution: "C = 2πr = 2π·7 = 14π" },
  { subject: "math", topic: "Геометрия", difficulty: "easy", category: "Планиметрия", text: "Найдите площадь ромба с диагоналями 6 и 8.", answer: "24", solution: "S = (d₁ · d₂) / 2 = (6 · 8) / 2 = 24" },
  { subject: "math", topic: "Геометрия", difficulty: "easy", category: "Планиметрия", text: "Найдите площадь трапеции с основаниями 4 и 6 и высотой 5.", answer: "25", solution: "S = (a + b)/2 · h = (4 + 6)/2 · 5 = 5 · 5 = 25" },
  { subject: "math", topic: "Геометрия", difficulty: "easy", category: "Окружность", text: "Найдите площадь круга радиуса 3.", answer: "9π", solution: "S = πr² = π · 3² = 9π" },

  // ─── Геометрия - Средний ─────────────────────────────────────────────────
  { subject: "math", topic: "Геометрия", difficulty: "medium", category: "Тригонометрия", text: "В треугольнике ABC: a = 5, b = 7, C = 60°. Найдите c.", answer: "√39", solution: "c² = a² + b² - 2ab·cosC = 25 + 49 - 2·5·7·(1/2) = 74 - 35 = 39. c = √39" },
  { subject: "math", topic: "Геометрия", difficulty: "medium", category: "Стереометрия", text: "Найдите объём куба с ребром 4.", answer: "64", solution: "V = a³ = 4³ = 64" },
  { subject: "math", topic: "Геометрия", difficulty: "medium", category: "Стереометрия", text: "Найдите объём шара радиуса 3.", answer: "36π", solution: "V = (4/3)πr³ = (4/3)π·27 = 36π" },
  { subject: "math", topic: "Геометрия", difficulty: "medium", category: "Тригонометрия", text: "Найдите sin 150°.", answer: "1/2", solution: "sin 150° = sin(180° - 30°) = sin 30° = 1/2" },
  { subject: "math", topic: "Геометрия", difficulty: "medium", category: "Планиметрия", text: "Медиана треугольника, проведённая к стороне 10, делит её пополам. Найдите длину отрезка от вершины до середины.", answer: "5", solution: "Медиана делит сторону пополам: 10/2 = 5" },

  // ─── Геометрия - Сложный ─────────────────────────────────────────────────
  { subject: "math", topic: "Геометрия", difficulty: "hard", category: "Стереометрия", text: "Основание пирамиды — квадрат со стороной 6. Высота пирамиды 4. Найдите объём.", answer: "48", solution: "V = (1/3) · S_основ · h = (1/3) · 36 · 4 = 48" },
  { subject: "math", topic: "Геометрия", difficulty: "hard", category: "Тригонометрия", text: "В треугольнике стороны 8, 15, 17. Найдите cos наибольшего угла.", answer: "0", solution: "8² + 15² = 64 + 225 = 289 = 17². Треугольник прямоугольный, наибольший угол = 90°, cos 90° = 0" },

  // ─── Производные - Лёгкий ────────────────────────────────────────────────
  { subject: "math", topic: "Производные", difficulty: "easy", category: "Производная", text: "Найдите производную: f(x) = x⁴", answer: "4x³", solution: "(xⁿ)' = nxⁿ⁻¹. f'(x) = 4x³" },
  { subject: "math", topic: "Производные", difficulty: "easy", category: "Производная", text: "Найдите производную: f(x) = 5x² - 3x + 2", answer: "10x - 3", solution: "f'(x) = 10x - 3" },
  { subject: "math", topic: "Производные", difficulty: "easy", category: "Производная", text: "Найдите производную: f(x) = sin x", answer: "cos x", solution: "(sin x)' = cos x" },
  { subject: "math", topic: "Производные", difficulty: "easy", category: "Производная", text: "Найдите производную: f(x) = eˣ", answer: "eˣ", solution: "(eˣ)' = eˣ" },
  { subject: "math", topic: "Производные", difficulty: "easy", category: "Производная", text: "Найдите производную: f(x) = ln x", answer: "1/x", solution: "(ln x)' = 1/x" },

  // ─── Производные - Средний ───────────────────────────────────────────────
  { subject: "math", topic: "Производные", difficulty: "medium", category: "Экстремум", text: "Найдите точки экстремума: f(x) = x³ - 3x", answer: "x = -1 (max), x = 1 (min)", solution: "f'(x) = 3x² - 3 = 3(x-1)(x+1). f'=0 при x=±1. f''(x) = 6x. f''(-1) = -6 < 0 (max). f''(1) = 6 > 0 (min)" },
  { subject: "math", topic: "Производные", difficulty: "medium", category: "Производная", text: "Найдите производную: f(x) = x² · sin x", answer: "2x·sin x + x²·cos x", solution: "По правилу произведения: (uv)' = u'v + uv'. f'(x) = 2x·sin x + x²·cos x" },
  { subject: "math", topic: "Производные", difficulty: "medium", category: "Экстремум", text: "На каком промежутке функция f(x) = -x² + 4x - 3 возрастает?", answer: "(-∞; 2)", solution: "f'(x) = -2x + 4. f'(x) > 0 при x < 2. Функция возрастает на (-∞; 2)" },
  { subject: "math", topic: "Производные", difficulty: "medium", category: "Производная", text: "Найдите производную: f(x) = (2x+1)⁵", answer: "10(2x+1)⁴", solution: "По правилу сложной функции: f'(x) = 5(2x+1)⁴ · 2 = 10(2x+1)⁴" },

  // ─── Производные - Сложный ───────────────────────────────────────────────
  { subject: "math", topic: "Производные", difficulty: "hard", category: "Экстремум", text: "Найдите наибольшее значение f(x) = x³ - 12x + 5 на [-3; 3].", answer: "21", solution: "f'(x) = 3x² - 12 = 0, x = ±2. f(-3) = -27+36+5=14; f(-2) = -8+24+5=21; f(2) = 8-24+5=-11; f(3) = 27-36+5=-4. Наибольшее: 21" },
  { subject: "math", topic: "Производные", difficulty: "hard", category: "Производная", text: "Найдите производную: f(x) = ln(sin x)", answer: "cos x / sin x = ctg x", solution: "f'(x) = (1/sin x) · cos x = cos x / sin x = ctg x" },

  // ─── Теория вероятностей - Лёгкий ────────────────────────────────────────
  { subject: "math", topic: "Теория вероятностей", difficulty: "easy", category: "Вероятность", text: "В ящике 3 красных и 7 синих шаров. Найдите вероятность вытащить красный.", answer: "0.3", solution: "P = 3 / (3 + 7) = 3/10 = 0.3" },
  { subject: "math", topic: "Теория вероятностей", difficulty: "easy", category: "Вероятность", text: "Монету бросают дважды. Найдите вероятность выпадения двух орлов.", answer: "0.25", solution: "P = (1/2) · (1/2) = 1/4 = 0.25" },
  { subject: "math", topic: "Теория вероятностей", difficulty: "easy", category: "Статистика", text: "Найдите среднее арифметическое: 4, 7, 3, 8, 3", answer: "5", solution: "x̄ = (4+7+3+8+3)/5 = 25/5 = 5" },
  { subject: "math", topic: "Теория вероятностей", difficulty: "easy", category: "Вероятность", text: "Вероятность события A равна 0.3. Найдите вероятность противоположного события.", answer: "0.7", solution: "P(Ā) = 1 - P(A) = 1 - 0.3 = 0.7" },

  // ─── Теория вероятностей - Средний ───────────────────────────────────────
  { subject: "math", topic: "Теория вероятностей", difficulty: "medium", category: "Комбинаторика", text: "Сколькими способами можно выбрать 2 книги из 5?", answer: "10", solution: "C(5,2) = 5!/(2!·3!) = (5·4)/(2·1) = 10" },
  { subject: "math", topic: "Теория вероятностей", difficulty: "medium", category: "Вероятность", text: "Вероятность попадания в цель при одном выстреле 0.8. Найдите вероятность попадания хотя бы одного из двух выстрелов.", answer: "0.96", solution: "P = 1 - P(оба промаха) = 1 - 0.2·0.2 = 1 - 0.04 = 0.96" },
  { subject: "math", topic: "Теория вероятностей", difficulty: "medium", category: "Статистика", text: "В выборке: 2, 4, 4, 6, 8. Найдите медиану.", answer: "4", solution: "Упорядоченный ряд: 2, 4, 4, 6, 8. Медиана — средний элемент = 4" },

  // ─── Теория вероятностей - Сложный ───────────────────────────────────────
  { subject: "math", topic: "Теория вероятностей", difficulty: "hard", category: "Вероятность", text: "Из 10 деталей 3 бракованных. Берут 2 детали. Найдите вероятность, что обе бракованные.", answer: "1/15", solution: "P = C(3,2)/C(10,2) = 3/45 = 1/15" },
  { subject: "math", topic: "Теория вероятностей", difficulty: "hard", category: "Комбинаторика", text: "Сколько 4-значных чисел можно составить из цифр 1, 2, 3, 4 без повторений?", answer: "24", solution: "A(4,4) = 4! = 24" },

  // ─── Параметры - Средний ─────────────────────────────────────────────────
  { subject: "math", topic: "Параметры", difficulty: "medium", category: "Параметры", text: "При каких значениях a уравнение ax = 6 имеет единственное решение?", answer: "a ≠ 0", solution: "При a ≠ 0: x = 6/a — единственное решение. При a = 0: 0 = 6 — нет решений." },
  { subject: "math", topic: "Параметры", difficulty: "medium", category: "Параметры", text: "При каких a уравнение x² - 2ax + a = 0 имеет два различных корня?", answer: "a < 0 или a > 1", solution: "D = 4a² - 4a > 0. a² - a > 0. a(a-1) > 0. a < 0 или a > 1" },
  { subject: "math", topic: "Параметры", difficulty: "medium", category: "Параметры", text: "При каких a прямая y = ax + 2 проходит через точку (1, 5)?", answer: "a = 3", solution: "5 = a·1 + 2, a = 3" },

  // ─── Параметры - Сложный ─────────────────────────────────────────────────
  { subject: "math", topic: "Параметры", difficulty: "hard", category: "Параметры", text: "При каких a система {x + y = a; x² + y² = 1} имеет решения?", answer: "-√2 ≤ a ≤ √2", solution: "y = a - x. x² + (a-x)² = 1. 2x² - 2ax + a² - 1 = 0. D = 4a² - 8(a²-1) ≥ 0. 8 - 4a² ≥ 0. a² ≤ 2. |a| ≤ √2" },
  { subject: "math", topic: "Параметры", difficulty: "hard", category: "Параметры", text: "Найдите все значения a, при которых уравнение |x - a| = 2x - 1 имеет ровно одно решение.", answer: "a = 1/3", solution: "Случай 1: x ≥ a: x - a = 2x - 1, x = 1 - a. Условие: 1-a ≥ a, a ≤ 1/2. Случай 2: x < a: a - x = 2x - 1, x = (a+1)/3. Условие: (a+1)/3 < a, a > 1/2. Для единственного решения нужно, чтобы только одно из условий выполнялось. При a = 1/2: оба дают x = 1/2. Нет, нужно проверить. При a = 1/3: x = 2/3 из случая 1 (2/3 ≥ 1/3 ✓), из случая 2: x = 4/9 < 1/3? Нет. Ответ: a = 1/3" },
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log(`Inserting ${TASKS.length} tasks...`);

  for (const task of TASKS) {
    await connection.execute(
      `INSERT IGNORE INTO tasks (subject, topic, difficulty, category, text, answer, solution, source, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [task.subject ?? 'math', task.topic, task.difficulty, task.category, task.text, task.answer, task.solution, 'seed']
    );
  }

  console.log("✅ Seeding complete!");
  await connection.end();
}

seed().catch(console.error);
