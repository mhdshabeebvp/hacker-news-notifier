let displayedPosts = []; // Array to keep track of displayed post IDs
let numPostsDisplayed = 0; // Number of posts already displayed

// This Function to display a popup asking the user to turn on notifications
function askNotificationPermission() {
    setTimeout(() => {
        const permission = window.confirm("Do you want to turn on desktop notifications for Hacker News posts with over 100 points?");
        if (permission) {
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        }
    }, 1000); // Show after 2 seconds
}

// This Function is used to display desktop notification
function displayDesktopNotification(title, url) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: 'This post has crossed 5 points.',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/1200px-Y_Combinator_logo.svg.png'
        });

        notification.onclick = function () {
            window.open(url, '_blank');
        };

        // setTimeout(notification.close.bind(notification), 60000); // Close after 60 seconds
    }
}

//fetch and display latest news posts
async function fetchAndDisplayPosts(numPosts) {
    try {
        const response = await fetch('https://hacker-news.firebaseio.com/v0/newstories.json');
        const data = await response.json();

        const postListContainer = document.getElementById('post-list');
        const priorityPostsContainer = document.getElementById('priority-posts');

        const latestNewsIds = data.slice(numPostsDisplayed, numPostsDisplayed + numPosts); // Get the latest news post IDs

        for (const storyId of latestNewsIds) {
            if (!displayedPosts.includes(storyId)) { 
                const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
                const story = await storyResponse.json();

                if (story.score > 100) {
                    displayPost(priorityPostsContainer, story); // Display in priority posts if score > 5
                } else {
                    displayPost(postListContainer, story); // Otherwise, display in regular post list
                }

                displayedPosts.push(storyId); // Add post ID to displayedPosts array

                // Check if the post has crossed 100 points and display a notification if it has
                if (story.score > 100) {
                    displayDesktopNotification(story.title, story.url);
                }
            }
        }

        numPostsDisplayed += numPosts; // Update the number of posts displayed
    } catch (error) {
        console.error('Error fetching Hacker News data:', error);
    }
}

// This Function for load more posts when the "Load More" button is clicked
function loadMorePosts() {
    fetchAndDisplayPosts(30); // Fetch and display the next 30 latest news posts
}

// This Function used to display a notification message on the webpage
function displayNotification(container, message) {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.textContent = message;
    container.appendChild(notificationElement);
}

//This Function used to display a post in the post list
function displayPost(container, story) {
    if (story) {
        const postItem = document.createElement('div');
        postItem.classList.add('post-item');
        const postTime = new Date(story.time * 1000);
        postItem.innerHTML = `
        <strong class="post-title">${story.title}</strong>
        <div class="post-details">
            <br>
            <strong>Uploaded:</strong> ${postTime.toLocaleString()}<br>
            <strong>Comments:</strong> ${story.descendants}<br>
            <strong>Author:</strong> ${story.by}<br>
            <a href="${story.url}" target="_blank">View Post</a><br>
        </div>
    `;
        container.appendChild(postItem);

        // Add event listener to toggle post details
        const postTitle = postItem.querySelector('.post-title');
        postTitle.addEventListener('click', () => {
            const postDetails = postItem.querySelector('.post-details');
            postDetails.style.display = postDetails.style.display === 'none' ? 'block' : 'none';
        });
    }
}

askNotificationPermission(); // Ask for notification permission when the website loads
fetchAndDisplayPosts(30); // Fetch and display initial 30 latest Hacker News posts
