export interface SampleFood {
  id: string;
  matchedName: string;
  defaultWeightGrams: number;
  imageUrl: string;
  title: string;
  category: string;
  description: string;
  expectedOutput: string;
}

export const SAMPLE_FOODS: SampleFood[] = [
  {
    id: 'sample_apple',
    matchedName: 'Apple, big (Malus domestica)',
    defaultWeightGrams: 150,
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    title: 'Red Apple',
    category: 'Fruits',
    description: 'Fresh crisp large red apple',
    expectedOutput: `Food: Apple, big (Malus domestica)\nWeight: 150g\nCalories: 93.6 kcal\nCarbs: 19.7g\nProtein: 0.4g\nFat: 1.0g`,
  },
  {
    id: 'sample_egg_boiled',
    matchedName: 'Egg, poultry, whole, boiled',
    defaultWeightGrams: 60,
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop&q=80',
    title: 'Boiled Egg',
    category: 'Eggs',
    description: 'Hard-boiled whole poultry egg',
    expectedOutput: `Food: Egg, poultry, whole, boiled\nWeight: 60g\nCalories: 88.6 kcal\nCarbs: 0.0g\nProtein: 8.1g\nFat: 6.3g`,
  },
  {
    id: 'sample_chicken_breast',
    matchedName: 'Chicken, poultry, breast, skinless',
    defaultWeightGrams: 200,
    imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80',
    title: 'Chicken Breast',
    category: 'Poultry & Game',
    description: 'Skinless tender chicken breast cutlet',
    expectedOutput: `Food: Chicken, poultry, breast, skinless\nWeight: 200g\nCalories: 336.5 kcal\nCarbs: 0.0g\nProtein: 43.6g\nFat: 18.0g`,
  },
  {
    id: 'sample_spinach',
    matchedName: 'Spinach (Spinacia oleracea)',
    defaultWeightGrams: 85,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    title: 'Fresh Spinach',
    category: 'Leafy Vegetables',
    description: 'Vibrant organic green spinach leaves',
    expectedOutput: `Food: Spinach (Spinacia oleracea)\nWeight: 85g\nCalories: 20.7 kcal\nCarbs: 1.7g\nProtein: 1.8g\nFat: 0.5g`,
  },
  {
    id: 'sample_paneer',
    matchedName: 'Paneer',
    defaultWeightGrams: 100,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    title: 'Paneer Cubes',
    category: 'Dairy & Milk',
    description: 'Fresh Indian cottage cheese block & cubes',
    expectedOutput: `Food: Paneer\nWeight: 100g\nCalories: 257.9 kcal\nCarbs: 12.4g\nProtein: 18.9g\nFat: 14.8g`,
  },
  {
    id: 'sample_banana',
    matchedName: 'Banana, ripe, robusta (Musa x paradisiaca)',
    defaultWeightGrams: 120,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    title: 'Ripe Banana',
    category: 'Fruits',
    description: 'Sweet ripe yellow banana',
    expectedOutput: `Food: Banana, ripe, robusta (Musa x paradisiaca)\nWeight: 120g\nCalories: 126.2 kcal\nCarbs: 28.4g\nProtein: 1.5g\nFat: 0.4g`,
  },
  {
    id: 'sample_almonds',
    matchedName: 'Almond (Prunus amygdalus)',
    defaultWeightGrams: 30,
    imageUrl: 'https://images.unsplash.com/photo-1508061252445-5350f3f94611?w=600&auto=format&fit=crop&q=80',
    title: 'Raw Almonds',
    category: 'Nuts & Seeds',
    description: 'Crunchy premium raw whole almonds',
    expectedOutput: `Food: Almond (Prunus amygdalus)\nWeight: 30g\nCalories: 182.8 kcal\nCarbs: 0.9g\nProtein: 5.5g\nFat: 17.5g`,
  },
  {
    id: 'sample_quinoa',
    matchedName: 'Quinoa (Chenopodium quinoa)',
    defaultWeightGrams: 180,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    title: 'Cooked Quinoa',
    category: 'Grains & Millets',
    description: 'Ancient grain superfood grains',
    expectedOutput: `Food: Quinoa (Chenopodium quinoa)\nWeight: 180g\nCalories: 591.1 kcal\nCarbs: 96.6g\nProtein: 23.6g\nFat: 9.9g`,
  },
  {
    id: 'sample_non_food',
    matchedName: 'NON_FOOD_TEST',
    defaultWeightGrams: 100,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    title: 'Computer Mouse (Non-Food Test)',
    category: 'Test Edge Case',
    description: 'Triggers the exact verification error check',
    expectedOutput: `Error: Item not found in verified dataset matrix.`,
  },
];
