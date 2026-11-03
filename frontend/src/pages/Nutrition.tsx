import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MealLog, FoodItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Utensils,
  Plus,
  Trash2,
  Calendar,
  Search,
  Apple,
  Flame,
  PieChart as PieIcon,
  CheckCircle2,
} from 'lucide-react';

export const Nutrition: React.FC = () => {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Meal Modal state
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'>('breakfast');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [foodCatalog, setFoodCatalog] = useState<FoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Custom Food Item Modal State
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    category: 'Indian Traditional',
    servingSize: 100,
    servingUnit: 'g',
    calories: 150,
    protein: 5,
    carbs: 20,
    fat: 5,
    fiber: 2,
  });

  const fetchMeals = async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/meals?date=${date}`);
      if (res.data?.success) {
        setMeals(res.data.data);
        setTotals(res.data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchCatalog = async (q: string) => {
    try {
      const res = await api.get(`/foods?q=${encodeURIComponent(q)}`);
      if (res.data?.success) {
        setFoodCatalog(res.data.data);
      }
    } catch (err) {
      console.error('Failed to search foods:', err);
    }
  };

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    searchCatalog(foodSearchQuery);
  }, [foodSearchQuery]);

  const handleAddFoodToMeal = (food: FoodItem) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        foodItemId: food._id,
        name: food.name,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        quantity: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
      },
    ]);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = Math.max(0.1, qty);
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please add at least one food item to this meal');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/meals', {
        date: selectedDate,
        mealType,
        items: selectedItems,
      });
      setIsMealModalOpen(false);
      setSelectedItems([]);
      await fetchMeals(selectedDate);
    } catch (err) {
      console.error('Failed to save meal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      await api.delete(`/meals/${id}`);
      await fetchMeals(selectedDate);
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/foods', customFood);
      setIsCustomFoodModalOpen(false);
      setCustomFood({
        name: '',
        category: 'Indian Traditional',
        servingSize: 100,
        servingUnit: 'g',
        calories: 150,
        protein: 5,
        carbs: 20,
        fat: 5,
        fiber: 2,
      });
      await searchCatalog('');
    } catch (err) {
      console.error('Failed to create custom food:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Nutrition & Macro Tracker
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Log meals with automatic macronutrient aggregation and Indian food catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#151B2B] border border-[#273349] px-3.5 py-1.5 rounded-xl">
            <Calendar size={16} className="text-lime-accent" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none font-medium cursor-pointer"
            />
          </div>

          <Button
            onClick={() => {
              setSelectedItems([]);
              setIsMealModalOpen(true);
            }}
            variant="primary"
          >
            <Plus size={18} />
            Log Meal
          </Button>

          <Button
            onClick={() => setIsCustomFoodModalOpen(true)}
            variant="outline"
          >
            Add Custom Food
          </Button>
        </div>
      </div>

      {/* Daily Nutrition Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="text-center p-4">
          <span className="text-xs text-gray-400">Total Calories</span>
          <div className="text-2xl font-black text-white mt-0.5">{totals.calories}</div>
          <span className="text-[10px] text-gray-500">kcal intake</span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-xs text-lime-accent">Protein</span>
          <div className="text-2xl font-black text-lime-accent mt-0.5">{totals.protein}g</div>
          <span className="text-[10px] text-gray-500">{Math.round(totals.protein * 4)} kcal</span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-xs text-violet-300">Carbohydrates</span>
          <div className="text-2xl font-black text-violet-300 mt-0.5">{totals.carbs}g</div>
          <span className="text-[10px] text-gray-500">{Math.round(totals.carbs * 4)} kcal</span>
        </Card>

        <Card className="text-center p-4">
          <span className="text-xs text-amber-400">Fats</span>
          <div className="text-2xl font-black text-amber-400 mt-0.5">{totals.fat}g</div>
          <span className="text-[10px] text-gray-500">{Math.round(totals.fat * 9)} kcal</span>
        </Card>

        <Card className="text-center p-4 col-span-2 sm:col-span-1">
          <span className="text-xs text-emerald-400">Dietary Fiber</span>
          <div className="text-2xl font-black text-emerald-400 mt-0.5">{totals.fiber}g</div>
          <span className="text-[10px] text-gray-500">digestive health</span>
        </Card>
      </div>

      {/* Meals Grouped by Type */}
      <div className="space-y-4">
        {['breakfast', 'lunch', 'dinner', 'snack', 'drink'].map((type) => {
          const typeMeals = meals.filter((m) => m.mealType === type);
          const typeCalories = typeMeals.reduce((s, m) => s + m.totalCalories, 0);

          return (
            <Card key={type} className="p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#273349]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lime-accent capitalize font-bold text-sm">
                    {type.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white capitalize">{type}</h3>
                    <span className="text-xs text-gray-400">
                      {typeMeals.length} recorded session{typeMeals.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{typeCalories} kcal</span>
                </div>
              </div>

              {typeMeals.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-500">
                  No {type} logged for this day. Click "Log Meal" to add items.
                </div>
              ) : (
                <div className="divide-y divide-[#273349]/50 mt-2">
                  {typeMeals.map((meal) => (
                    <div key={meal._id} className="py-3 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          {meal.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-[#151B2B] border border-[#273349] px-2.5 py-1 rounded-lg text-gray-200"
                            >
                              {item.name}{' '}
                              <span className="text-gray-400">
                                ({item.quantity}x {item.servingUnit})
                              </span>
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-gray-400 flex gap-3 pt-1">
                          <span>P: {meal.totalProtein}g</span>
                          <span>C: {meal.totalCarbs}g</span>
                          <span>F: {meal.totalFat}g</span>
                          <span>Fiber: {meal.totalFiber}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-sm font-bold text-lime-accent">
                          {meal.totalCalories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteMeal(meal._id)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded"
                          title="Delete meal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Log Meal Modal */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title="Log Meal Consumption"
      >
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Meal Category
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as any)}
              className="w-full bg-[#0B0F19] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none capitalize"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="drink">Drink</option>
            </select>
          </div>

          {/* Search catalog */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Search Food Database (40+ items including Indian staples)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                placeholder="Search Roti, Rice, Dal, Paneer, Oats, Eggs..."
                className="w-full bg-[#0B0F19] border border-[#273349] focus:border-lime-accent rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            {/* Catalog list dropdown */}
            <div className="mt-2 max-h-40 overflow-y-auto bg-[#0B0F19] rounded-xl border border-[#273349] divide-y divide-[#273349]">
              {foodCatalog.slice(0, 10).map((f) => (
                <div
                  key={f._id}
                  className="p-2.5 flex items-center justify-between hover:bg-[#151B2B] cursor-pointer text-xs transition-colors"
                  onClick={() => handleAddFoodToMeal(f)}
                >
                  <div>
                    <div className="font-semibold text-white">{f.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {f.servingSize} {f.servingUnit} • {f.calories} kcal • P: {f.protein}g C: {f.carbs}g F: {f.fat}g
                    </div>
                  </div>
                  <span className="text-lime-accent hover:underline font-bold">+ Add</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Items In This Meal ({selectedItems.length})
            </label>
            {selectedItems.length === 0 ? (
              <div className="p-3 bg-[#0B0F19] border border-dashed border-[#273349] rounded-xl text-center text-xs text-gray-500">
                Click "+ Add" on items above to include them in this meal.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#0B0F19] border border-[#273349] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-[11px] text-gray-400">
                        {Math.round(item.calories * item.quantity)} kcal • P: {(item.protein * item.quantity).toFixed(1)}g
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-[11px]">Qty:</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        className="w-16 bg-[#151B2B] border border-[#273349] rounded px-2 py-1 text-white text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsMealModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Meal Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Custom Food Item Modal */}
      <Modal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        title="Create Custom Food Item"
      >
        <form onSubmit={handleCreateCustomFood} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Food Item Name
            </label>
            <input
              type="text"
              required
              value={customFood.name}
              onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
              placeholder="e.g. Masala Oats with Chia"
              className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Serving Size
              </label>
              <input
                type="number"
                value={customFood.servingSize}
                onChange={(e) => setCustomFood({ ...customFood, servingSize: Number(e.target.value) })}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Serving Unit
              </label>
              <input
                type="text"
                value={customFood.servingUnit}
                onChange={(e) => setCustomFood({ ...customFood, servingUnit: e.target.value })}
                placeholder="e.g. bowl, g, piece"
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={customFood.calories}
                onChange={(e) => setCustomFood({ ...customFood, calories: Number(e.target.value) })}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={customFood.protein}
                onChange={(e) => setCustomFood({ ...customFood, protein: Number(e.target.value) })}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={customFood.carbs}
                onChange={(e) => setCustomFood({ ...customFood, carbs: Number(e.target.value) })}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={customFood.fat}
                onChange={(e) => setCustomFood({ ...customFood, fat: Number(e.target.value) })}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={customFood.fiber}
                onChange={(e) => setCustomFood({ ...customFood, fiber: Number(e.target.value) })}
                className="w-full bg-[#0B0F19] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsCustomFoodModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Custom Food
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
