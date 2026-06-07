// Goals are stored in electron-store, no API calls.
// These handlers receive the store instance.

function getGoals(store) {
  return store.get('goals', []);
}

function addGoal(store, goal) {
  const goals = getGoals(store);
  const newGoal = {
    id: Date.now().toString(),
    ...goal,
    createdAt: new Date().toISOString(),
  };
  goals.push(newGoal);
  store.set('goals', goals);
  return newGoal;
}

function updateGoalProgress(store, goalId, currentValue) {
  const goals = getGoals(store);
  const goal = goals.find(g => g.id === goalId);
  if (goal) {
    goal.current = currentValue;
    store.set('goals', goals);
  }
}

function deleteGoal(store, goalId) {
  const goals = getGoals(store).filter(g => g.id !== goalId);
  store.set('goals', goals);
}

module.exports = { getGoals, addGoal, updateGoalProgress, deleteGoal };