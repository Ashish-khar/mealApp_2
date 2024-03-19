// JavaScript code
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const favoriteMealsList = document.getElementById('favoriteMealsList');
const mealDetailContainer = document.getElementById('mealDetail');
const homePage = document.getElementById('homePage');
const mealDetailPage = document.getElementById('mealDetailPage');
const backToHome = document.getElementById('backToHome');

let searchTimeout;

// Function to fetch meals from the API
async function searchMeals(query) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await response.json();
    return data.meals;
}

// Function to fetch meal details from the API
async function fetchMealDetail(mealId) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const data = await response.json();
    return data.meals[0];
}

// Function to get favorite meals from local storage
function getFavoriteMeals() {
    const favoriteMeals = JSON.parse(localStorage.getItem('favoriteMeals')) || [];
    return favoriteMeals;
}

// Function to save favorite meals to local storage
function saveFavoriteMeals(favoriteMeals) {
    localStorage.setItem('favoriteMeals', JSON.stringify(favoriteMeals));
    displayFavoriteMealsSidebar(); // Update sidebar
}

// Function to display search results
function displaySearchResults(meals) {
    if (!meals) {
        searchResults.innerHTML = '';
        return;
    }

    const html = meals.map(meal => `
        <div class="meal" data-id="${meal.idMeal}">
            <div class="meal-details">
                <h3>${meal.strMeal}</h3>
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            </div>
            <div class="meal-actions">
                <button class="detail-btn">Details</button>
                <button class="favorite-btn">Favorite</button>
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = html;
}

// Function to display meal detail
function displayMealDetail(meal) {
    const html = `
        <div class="meal-detail-info">
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Area:</strong> ${meal.strArea}</p>
            <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
        </div>
    `;
    mealDetailContainer.innerHTML = html;
}

// Function to display favorite meals in the sidebar
function displayFavoriteMealsSidebar() {
    favoriteMealsList.innerHTML = '';
    const favoriteMeals = getFavoriteMeals();
    favoriteMeals.forEach(meal => {
        const listItem = document.createElement('li');
        listItem.textContent = meal.name;
        listItem.dataset.id = meal.id;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeFavoriteMeal(meal.id);
            displayFavoriteMealsSidebar();
        });
        listItem.appendChild(removeButton);
        favoriteMealsList.appendChild(listItem);
    });
}

// Function to add a meal to favorites
function addFavoriteMeal(meal) {
    const favoriteMeals = getFavoriteMeals();
    favoriteMeals.push(meal);
    saveFavoriteMeals(favoriteMeals);
}

// Function to remove a meal from favorites
function removeFavoriteMeal(mealId) {
    let favoriteMeals = getFavoriteMeals();
    favoriteMeals = favoriteMeals.filter(meal => meal.id !== mealId);
    saveFavoriteMeals(favoriteMeals);
}

// Function to handle detail button click
function handleButtonClick(event) {
    const meal = event.target.closest('.meal');
    if (!meal) return;
    const mealId = meal.dataset.id;

    if (event.target.classList.contains('detail-btn')) {
        // If the clicked button is a detail button
        fetchMealDetail(mealId)
            .then(meal => {
                displayMealDetail(meal);
                homePage.style.display = 'none';
                mealDetailPage.style.display = 'block';
            })
            .catch(error => console.error('Error fetching meal detail:', error));
    } else if (event.target.classList.contains('favorite-btn')) {
        // If the clicked button is a favorite button
        const mealName = meal.querySelector('h3').textContent;
        const mealData = { id: mealId, name: mealName };
        addFavoriteMeal(mealData);
    }
}

// Function to handle search input
function handleSearchInput() {
    clearTimeout(searchTimeout);
    const query = searchInput.value;
    searchTimeout = setTimeout(async () => {
        const meals = await searchMeals(query);
        displaySearchResults(meals);
    }, 500);
}

// Event listeners
searchInput.addEventListener('input', handleSearchInput);
searchResults.addEventListener('click', handleButtonClick);
backToHome.addEventListener('click', () => {
    homePage.style.display = 'block';
    mealDetailPage.style.display = 'none';
});

// Call displayFavoriteMealsSidebar when the page loads
displayFavoriteMealsSidebar();
