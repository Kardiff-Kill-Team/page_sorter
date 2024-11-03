// ==UserScript==
// @name         Warhammer Kill Team Rules Sorter
// @namespace    https://greasyfork.org/en/users/Kardiff
// @version      1.0.0
// @description  Adds sorting functionality to Warhammer Kill Team rules page. Sort alphabetically or by update date, with US date format display.
// @author       Kardiff
// @match        https://www.warhammer-community.com/*/downloads/kill-team/
// @grant        GM_log
// @license      MIT
// @run-at       document-idle
// @supportURL   https://github.com/Kardiff-Kill-Team/page_sorter/issues
// @homepageURL  https://github.com/Kardiff-Kill-Team/page_sorter
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 Kardiff

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function() {
    'use strict';

    const styles = `
        .sort-controls {
            position: sticky;
            top: 0;
            background: white;
            padding: 10px;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        .sort-button {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            background: #234;
            color: white;
            cursor: pointer;
            font-weight: bold;
            min-width: 150px;
        }
        .sort-button:hover {
            background: #345;
        }
    `;

    // Add styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    function formatDateToUS(dateText) {
        const [day, month, year] = dateText.split('/');
        return `${month}/${day}/${year}`;
    }

    function initializeSorter(container) {
        // Create control buttons
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'sort-controls';
        
        const alphabeticalButton = document.createElement('button');
        alphabeticalButton.textContent = 'Sort A-Z';
        alphabeticalButton.className = 'sort-button';
        
        const dateButton = document.createElement('button');
        dateButton.textContent = 'Sort by Latest Update';
        dateButton.className = 'sort-button';

        controlsDiv.appendChild(alphabeticalButton);
        controlsDiv.appendChild(dateButton);
        container.parentElement.insertBefore(controlsDiv, container);

        // Initial date conversion
        container.querySelectorAll('.shared-downloadCard').forEach(card => {
            const dateSpan = card.querySelector('.border-t span.ml-5');
            if (dateSpan) {
                dateSpan.textContent = formatDateToUS(dateSpan.textContent.trim());
            }
        });

        function getTeamBoxes() {
            return Array.from(container.querySelectorAll('.shared-downloadCard'));
        }

        function getTeamName(box) {
            const link = box.querySelector('a[download]');
            return link ? link.textContent.trim() : '';
        }

        function getLastUpdated(box) {
            const dateText = box.querySelector('.border-t span.ml-5');
            if (dateText) {
                const [month, day, year] = dateText.textContent.split('/');
                return new Date(`${year}-${month}-${day}`);
            }
            return new Date(0);
        }

        function sortBoxes(sortFunction) {
            const boxes = getTeamBoxes();
            if (boxes.length === 0) return;

            // Sort boxes
            const sortedBoxes = [...boxes].sort(sortFunction);
            
            // Clear and reappend
            sortedBoxes.forEach(box => container.appendChild(box));
        }

        function sortAlphabetically() {
            sortBoxes((a, b) => getTeamName(a).localeCompare(getTeamName(b)));
        }

        function sortByDate() {
            sortBoxes((a, b) => {
                const dateCompare = getLastUpdated(b) - getLastUpdated(a);
                if (dateCompare === 0) {
                    // If dates are equal, sort alphabetically
                    return getTeamName(a).localeCompare(getTeamName(b));
                }
                return dateCompare;
            });
        }

        alphabeticalButton.addEventListener('click', sortAlphabetically);
        dateButton.addEventListener('click', sortByDate);

        // Initial sort
        setTimeout(sortAlphabetically, 1000);
    }

    // Watch for content to load
    const observer = new MutationObserver((mutations, obs) => {
        const downloadCards = document.querySelectorAll('.shared-downloadCard');
        if (downloadCards.length > 0) {
            const container = downloadCards[0].parentElement;
            if (container && !document.querySelector('.sort-controls')) {
                obs.disconnect();
                initializeSorter(container);
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Fallback timeout
    setTimeout(() => {
        observer.disconnect();
        const downloadCards = document.querySelectorAll('.shared-downloadCard');
        if (downloadCards.length > 0) {
            const container = downloadCards[0].parentElement;
            if (container && !document.querySelector('.sort-controls')) {
                initializeSorter(container);
            }
        }
    }, 10000);
})();
