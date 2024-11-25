document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const counter = document.querySelector(".loader-counter");

    let count = 0;
    const duration = 2500; // Minimum duration in milliseconds
    const interval = 10; // Update interval in milliseconds
    const maxCount = 100;

    const easeInOut = (t) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // Ease in-out formula

    const startTime = Date.now();

    const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1); // Ensure it doesn't exceed 1
        const easedProgress = easeInOut(progress);

        count = Math.round(maxCount * easedProgress);
        counter.textContent = count;

        if (elapsed < duration) {
            requestAnimationFrame(updateCounter);
        } else {
            completeLoading();
        }
    };

    const completeLoading = () => {
        loader.classList.add("loader-exit");

        loader.addEventListener("animationend", () => {
            loader.remove(); // Remove the loader from the DOM
        });
    };

    updateCounter();
});