/**
 * Static Mise sample content for bootstrap (no Agent API required).
 */
import {markdownToPortableText} from '@portabletext/markdown'
import {ref} from './helpers.ts'

function localeRef(code: string) {
  return ref(`locale-${code}`)
}

function i18nString(en: string, hi: string) {
  return [
    {_type: 'internationalizedArrayStringValue', _key: 'en-US', language: 'en-US', value: en},
    {_type: 'internationalizedArrayStringValue', _key: 'hi-IN', language: 'hi-IN', value: hi},
  ]
}

function translation(locale: string, text: string) {
  return {
    _type: 'l10n.glossary.entry.translation',
    locale: localeRef(locale),
    translation: text,
  }
}

const dntEntries = [
  {
    _type: 'l10n.glossary.entry',
    term: 'Mise',
    status: 'approved',
    doNotTranslate: true,
    partOfSpeech: 'noun',
    definition: 'Brand name for the kitchen operating system',
    context: 'Always keep as "Mise" in all locales.',
  },
  {
    _type: 'l10n.glossary.entry',
    term: 'biryani',
    status: 'approved',
    doNotTranslate: false,
    partOfSpeech: 'noun',
    definition: 'A mixed rice dish of Indian origin',
    translations: [translation('hi-IN', 'बiryानी')],
  },
  {
    _type: 'l10n.glossary.entry',
    term: 'mise en place',
    status: 'approved',
    doNotTranslate: true,
    partOfSpeech: 'phrase',
    definition: 'French culinary phrase for preparing ingredients before cooking',
  },
  {
    _type: 'l10n.glossary.entry',
    term: 'pantry',
    status: 'approved',
    translations: [translation('hi-IN', 'पेंट्री')],
  },
]

export const glossaryDocument = {
  _id: 'glossary-mise-culinary',
  _type: 'l10n.glossary',
  title: 'Mise Culinary Terminology',
  sourceLocale: localeRef('en-US'),
  entries: dntEntries,
}

export const styleGuideDocuments = [
  {
    _id: 'style-guide-hi-IN',
    _type: 'l10n.styleGuide',
    title: 'Hindi (India) Style Guide',
    locale: localeRef('hi-IN'),
    formality: 'informal',
    tone: ['warm', 'approachable', 'clear'],
    additionalInstructions: markdownToPortableText(
      'Target audience: Home cooks using Mise in Indian kitchens.\n\n' +
        'Use accessible Hindi for everyday cooking terms. Keep the brand name "Mise" in Latin script.\n\n' +
        'Prefer active voice and short sentences suitable for reading from a distance in the kitchen.\n\n' +
        'Do not translate ingredient brand names or the word "Mise".',
    ),
  },
]

export const ingredients = [
  {
    _id: 'ingredient-basmati-rice',
    _type: 'ingredient',
    name: i18nString('Basmati rice', 'बासमती चावल'),
    defaultUnit: i18nString('cups', 'कप'),
  },
  {
    _id: 'ingredient-chicken',
    _type: 'ingredient',
    name: i18nString('Chicken thighs', 'चिकन की जांघ'),
    defaultUnit: i18nString('lbs', 'पाउंड'),
  },
  {
    _id: 'ingredient-yogurt',
    _type: 'ingredient',
    name: i18nString('Yogurt', 'दही'),
    defaultUnit: i18nString('cups', 'कप'),
  },
  {
    _id: 'ingredient-onion',
    _type: 'ingredient',
    name: i18nString('Onion', 'प्याज'),
    defaultUnit: i18nString('medium', 'मध्यम'),
  },
  {
    _id: 'ingredient-ghee',
    _type: 'ingredient',
    name: i18nString('Ghee', 'घी'),
    defaultUnit: i18nString('tbsp', 'बड़ा चम्मच'),
  },
  {
    _id: 'ingredient-tomatoes',
    _type: 'ingredient',
    name: i18nString('Tomatoes', 'टमाटर'),
    defaultUnit: i18nString('cups', 'कप'),
  },
]

export const recipeCategories = [
  {
    _id: 'category-indian',
    _type: 'recipeCategory',
    title: i18nString('Indian', 'भारतीय'),
    slug: {_type: 'slug', current: 'indian'},
  },
  {
    _id: 'category-comfort',
    _type: 'recipeCategory',
    title: i18nString('Comfort Food', 'आरामदायक भोजन'),
    slug: {_type: 'slug', current: 'comfort-food'},
  },
]

export const pantryCategories = [
  {
    _id: 'pantry-cat-grains',
    _type: 'pantryCategory',
    title: i18nString('Grains & Rice', 'अनाज और चावल'),
    sortOrder: 1,
  },
  {
    _id: 'pantry-cat-protein',
    _type: 'pantryCategory',
    title: i18nString('Protein', 'प्रोटीन'),
    sortOrder: 2,
  },
  {
    _id: 'pantry-cat-spices',
    _type: 'pantryCategory',
    title: i18nString('Spices', 'मसाले'),
    sortOrder: 3,
  },
]

const today = new Date().toISOString().split('T')[0]

export const recipesEn = [
  {
    _id: 'recipe-chicken-biryani-en-US',
    _type: 'recipe',
    language: 'en-US',
    title: 'Classic Chicken Biryani',
    slug: {_type: 'slug', current: 'classic-chicken-biryani'},
    summary:
      'Fragrant basmati rice layered with spiced yogurt-marinated chicken — a show-stopping one-pot dinner.',
    prepTimeMinutes: 45,
    cookTimeMinutes: 60,
    servings: 6,
    tags: ['one-pot', 'weekend', 'family'],
    categories: [ref('category-indian'), ref('category-comfort')],
    ingredients: [
      {
        _key: 'ing1',
        ingredient: ref('ingredient-basmati-rice'),
        quantity: 3,
        unit: i18nString('cups', 'कप'),
      },
      {
        _key: 'ing2',
        ingredient: ref('ingredient-chicken'),
        quantity: 2,
        unit: i18nString('lbs', 'पाउंड'),
      },
      {
        _key: 'ing3',
        ingredient: ref('ingredient-yogurt'),
        quantity: 1,
        unit: i18nString('cup', 'कप'),
      },
      {
        _key: 'ing4',
        ingredient: ref('ingredient-onion'),
        quantity: 2,
        unit: i18nString('medium', 'मध्यम'),
      },
      {
        _key: 'ing5',
        ingredient: ref('ingredient-ghee'),
        quantity: 4,
        unit: i18nString('tbsp', 'बड़ा चम्मच'),
      },
    ],
    steps: [
      {
        _key: 'step1',
        instruction: 'Rinse basmati rice until water runs clear, then soak for 30 minutes.',
        durationMinutes: 30,
      },
      {
        _key: 'step2',
        instruction: 'Marinate chicken in yogurt, spices, and half the fried onions for at least 1 hour.',
        durationMinutes: 60,
      },
      {
        _key: 'step3',
        instruction: 'Par-cook rice until 70% done, then layer with marinated chicken in a heavy pot.',
      },
      {
        _key: 'step4',
        instruction: 'Cover tightly and cook on low heat for 25 minutes. Rest 10 minutes before serving.',
        durationMinutes: 35,
      },
    ],
    nutrition: {
      _type: 'nutritionInfo',
      calories: 520,
      protein: 32,
      carbs: 58,
      fat: 18,
      fiber: 3,
    },
  },
  {
    _id: 'recipe-herbed-lentils-en-US',
    _type: 'recipe',
    language: 'en-US',
    title: 'Herbed Lentil Stew',
    slug: {_type: 'slug', current: 'herbed-lentil-stew'},
    summary: 'A quick, protein-rich stew for weeknight dinners.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    servings: 4,
    tags: ['weeknight', 'vegetarian'],
    categories: [ref('category-comfort')],
    ingredients: [
      {
        _key: 'ing1',
        ingredient: ref('ingredient-onion'),
        quantity: 1,
        unit: i18nString('medium', 'मध्यम'),
      },
      {
        _key: 'ing2',
        ingredient: ref('ingredient-tomatoes'),
        quantity: 2,
        unit: i18nString('cups', 'कप'),
      },
    ],
    steps: [
      {_key: 'step1', instruction: 'Sauté onions until golden.'},
      {_key: 'step2', instruction: 'Add lentils, tomatoes, and broth. Simmer until tender.'},
    ],
    nutrition: {_type: 'nutritionInfo', calories: 310, protein: 18, carbs: 42, fat: 6, fiber: 12},
  },
]

export const recipesHi = [
  {
    _id: 'recipe-chicken-biryani-hi-IN',
    _type: 'recipe',
    language: 'hi-IN',
    title: 'क्लासिक चिकन बiryानी',
    slug: {_type: 'slug', current: 'classic-chicken-biryani'},
    summary:
      'मसालेदार दही में मैरीनेट चिकन के साथ सुगंधित बासमती चावल — एक शानदार वन-पॉट डिनर।',
    prepTimeMinutes: 45,
    cookTimeMinutes: 60,
    servings: 6,
    tags: ['one-pot', 'weekend', 'family'],
    categories: [ref('category-indian'), ref('category-comfort')],
    ingredients: recipesEn[0].ingredients,
    steps: [
      {
        _key: 'step1',
        instruction: 'बासमती चावल को तब तक धोएं जब तक पानी साफ न हो जाए, फिर 30 मिनट भिगोएं।',
        durationMinutes: 30,
      },
      {
        _key: 'step2',
        instruction:
          'चिकन को दही, मसालों और आधे भुने हुए प्याज के साथ कम से कम 1 घंटे के लिए मैरीनेट करें।',
        durationMinutes: 60,
      },
      {
        _key: 'step3',
        instruction:
          'चावल को 70% पकाएं, फिर मैरीनेट चिकन के साथ भारी बर्तन में परतें बनाएं।',
      },
      {
        _key: 'step4',
        instruction:
          'कसकर ढककर 25 मिनट धीमी आंच पर पकाएं। परोसने से पहले 10 मिनट आराम दें।',
        durationMinutes: 35,
      },
    ],
    nutrition: recipesEn[0].nutrition,
  },
  {
    _id: 'recipe-herbed-lentils-hi-IN',
    _type: 'recipe',
    language: 'hi-IN',
    title: 'हर्ब्ड दाल स्टू',
    slug: {_type: 'slug', current: 'herbed-lentil-stew'},
    summary: 'वीकनाइट डिनर के लिए त्वरित, प्रोटीन से भरपूर स्टू।',
    prepTimeMinutes: 15,
    cookTimeMinutes: 35,
    servings: 4,
    tags: ['weeknight', 'vegetarian'],
    categories: [ref('category-comfort')],
    ingredients: recipesEn[1].ingredients,
    steps: [
      {_key: 'step1', instruction: 'प्याज को सुनहरा होने तक भूनें।'},
      {_key: 'step2', instruction: 'दाल, टमाटर और शोरबा डालें। नरम होने तक उबालें।'},
    ],
    nutrition: recipesEn[1].nutrition,
  },
]

export const translationMetadata = [
  {
    _id: 'translation.metadata.recipe-chicken-biryani',
    _type: 'translation.metadata',
    schemaTypes: ['recipe'],
    translations: [
      {_key: 'en-US', value: ref('recipe-chicken-biryani-en-US')},
      {_key: 'hi-IN', value: ref('recipe-chicken-biryani-hi-IN')},
    ],
  },
  {
    _id: 'translation.metadata.recipe-herbed-lentils',
    _type: 'translation.metadata',
    schemaTypes: ['recipe'],
    translations: [
      {_key: 'en-US', value: ref('recipe-herbed-lentils-en-US')},
      {_key: 'hi-IN', value: ref('recipe-herbed-lentils-hi-IN')},
    ],
  },
]

export const homePages = [
  {
    _id: 'homePage-en-US',
    _type: 'homePage',
    language: 'en-US',
    title: 'Good morning, Chef',
    greeting: 'Good morning, Chef',
    subtitle: 'Your kitchen is organized and ready. Here is what is planned for today.',
    mealsToday: [
      {
        _key: 'meal1',
        date: today,
        mealType: 'breakfast',
        label: 'Overnight oats with berries',
      },
      {
        _key: 'meal2',
        date: today,
        mealType: 'lunch',
        recipe: ref('recipe-herbed-lentils-en-US'),
      },
      {
        _key: 'meal3',
        date: today,
        mealType: 'dinner',
        recipe: ref('recipe-chicken-biryani-en-US'),
      },
    ],
    featuredRecipes: [ref('recipe-chicken-biryani-en-US'), ref('recipe-herbed-lentils-en-US')],
    quickActionLabels: {
      logMeal: 'Log a Meal',
      newRecipe: 'New Recipe',
      addToPantry: 'Add to Pantry',
    },
  },
  {
    _id: 'homePage-hi-IN',
    _type: 'homePage',
    language: 'hi-IN',
    title: 'सुप्रभात, शेफ',
    greeting: 'सुप्रभात, शेफ',
    subtitle: 'आपकी रसोई व्यवस्थित है। आज के लिए यहाँ योजना है।',
    mealsToday: [
      {
        _key: 'meal1',
        date: today,
        mealType: 'breakfast',
        label: 'बेरीज़ के साथ ओवरनाइट ओट्स',
      },
      {
        _key: 'meal2',
        date: today,
        mealType: 'lunch',
        recipe: ref('recipe-herbed-lentils-hi-IN'),
      },
      {
        _key: 'meal3',
        date: today,
        mealType: 'dinner',
        recipe: ref('recipe-chicken-biryani-hi-IN'),
      },
    ],
    featuredRecipes: [ref('recipe-chicken-biryani-hi-IN'), ref('recipe-herbed-lentils-hi-IN')],
    quickActionLabels: {
      logMeal: 'भोजन दर्ज करें',
      newRecipe: 'नई रेसिपी',
      addToPantry: 'पेंट्री में जोड़ें',
    },
  },
]

export const pantrySnapshots = [
  {
    _id: 'pantrySnapshot-en-US',
    _type: 'pantrySnapshot',
    language: 'en-US',
    title: 'Demo Pantry',
    description: 'Sample household inventory for the Mise demo.',
    items: [
      {
        _key: 'p1',
        ingredient: ref('ingredient-basmati-rice'),
        quantity: 4,
        capacity: 5,
        unit: i18nString('lbs', 'पाउंड'),
        category: ref('pantry-cat-grains'),
        location: i18nString('Pantry shelf A', 'पेंट्री शेल्फ A'),
      },
      {
        _key: 'p2',
        ingredient: ref('ingredient-chicken'),
        quantity: 0.5,
        capacity: 2,
        unit: i18nString('lbs', 'पाउंड'),
        category: ref('pantry-cat-protein'),
        location: i18nString('Refrigerator', 'रेफ्रिजरेटर'),
      },
      {
        _key: 'p3',
        ingredient: ref('ingredient-ghee'),
        quantity: 0.15,
        capacity: 1,
        unit: i18nString('jar', 'जार'),
        category: ref('pantry-cat-spices'),
        location: i18nString('Spice drawer', 'मसाला दराज'),
      },
    ],
  },
  {
    _id: 'pantrySnapshot-hi-IN',
    _type: 'pantrySnapshot',
    language: 'hi-IN',
    title: 'डेमो पेंट्री',
    description: 'Mise डेमो के लिए नमूना घरेलू इन्वेंटरी।',
    items: [
      {
        _key: 'p1',
        ingredient: ref('ingredient-basmati-rice'),
        quantity: 4,
        capacity: 5,
        unit: i18nString('lbs', 'पाउंड'),
        category: ref('pantry-cat-grains'),
        location: i18nString('Pantry shelf A', 'पेंट्री शेल्फ A'),
      },
      {
        _key: 'p2',
        ingredient: ref('ingredient-chicken'),
        quantity: 0.5,
        capacity: 2,
        unit: i18nString('lbs', 'पाउंड'),
        category: ref('pantry-cat-protein'),
        location: i18nString('Refrigerator', 'रेफ्रिजरेटर'),
      },
      {
        _key: 'p3',
        ingredient: ref('ingredient-ghee'),
        quantity: 0.15,
        capacity: 1,
        unit: i18nString('jar', 'जार'),
        category: ref('pantry-cat-spices'),
        location: i18nString('Spice drawer', 'मसाला दराज'),
      },
    ],
  },
]

export function allMiseDocuments() {
  return [
    glossaryDocument,
    ...styleGuideDocuments,
    ...ingredients,
    ...recipeCategories,
    ...pantryCategories,
    ...recipesEn,
    ...recipesHi,
    ...translationMetadata,
    ...homePages,
    ...pantrySnapshots,
  ]
}
