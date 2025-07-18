document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const dashboardContent = document.getElementById('dashboard-content');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const password = passwordInput.value;
        if (password === 'admin') {
            loginContainer.style.display = 'none';
            dashboardContent.style.display = 'block';
            loginError.style.display = 'none';
            initializeDashboard(); // Call function to initialize dashboard
        } else {
            loginError.style.display = 'block';
        }
    });

    // All existing dashboard logic will go into this function
    function initializeDashboard() {
        const initialTeamData = [
            { "name": "Team Elite" }, { "name": "GodLike" }, { "name": "TSM Entity" }, { "name": "Orange Rock" }, 
            { "name": "Galaxy Racer" }, { "name": "Total Gaming" }, { "name": "Scout's Team" }, { "name": "Fnatic" }, 
            { "name": "Hydra Official" }, { "name": "Team SoloMid" }, { "name": "Future Station" }, { "name": "Team IND" }
        ];

        function getTeamData() {
            let data;
            try {
                data = JSON.parse(localStorage.getItem('tournamentData'));
            } catch (e) {
                data = null;
            }

            if (!data || !Array.isArray(data)) {
                const newData = initialTeamData.map(t => ({ ...t, matches: 0, kills: 0, points: 0, matchHistory: [] }));
                localStorage.setItem('tournamentData', JSON.stringify(newData));
                return newData;
            }

            return data.map(team => ({
                name: team.name || 'Unknown Team',
                matches: team.matches || 0,
                kills: team.kills || 0,
                points: team.points || 0,
                matchHistory: team.matchHistory || []
            }));
        }

        function saveTeamData(data) { 
            try {
                localStorage.setItem('tournamentData', JSON.stringify(data)); 
                window.dispatchEvent(new StorageEvent('storage', { key: 'tournamentData' }));
            } catch (e) {
                console.error("Failed to save team data:", e);
                alert("Error: Could not save data. Your browser's storage might be full or disabled.");
            }
        }

        function populateTeamSelects() {
            const teamData = getTeamData();
            const teamSelect = document.getElementById('team-select');
            const deleteSelect = document.getElementById('delete-team-select');
            teamSelect.innerHTML = '<option value="">Select Team to Update</option>';
            deleteSelect.innerHTML = '<option value="">Select Team to Delete</option>';
            teamData.forEach(team => {
                const option = `<option value="${team.name}">${team.name}</option>`;
                teamSelect.innerHTML += option;
                deleteSelect.innerHTML += option;
            });
        }

        function handleUpdate(event) {
            event.preventDefault();
            const teamName = document.getElementById('team-select').value;
            const kills = parseInt(document.getElementById('kills-input').value, 10);
            const placementPoints = parseInt(document.getElementById('placement-input').value, 10);
            const matchDate = document.getElementById('match-date-input').value;

            if (!teamName || isNaN(kills) || isNaN(placementPoints) || !matchDate) {
                return alert('Please fill out all fields correctly.');
            }

            const teamData = getTeamData();
            const team = teamData.find(t => t.name === teamName);

            if (team) {
                team.matches += 1;
                team.kills += kills;
                team.points += placementPoints;

                saveTeamData(teamData);
                populateTeamSelects();
                event.target.reset();
                alert('Points updated successfully on the main scoreboard!');
            } else {
                alert('Team not found.');
            }
        }

        function getTournamentHistory() {
            const history = localStorage.getItem('tournamentHistory');
            return history ? JSON.parse(history) : [];
        }

        function saveTournamentHistory(history) {
            localStorage.setItem('tournamentHistory', JSON.stringify(history));
            window.dispatchEvent(new StorageEvent('storage', { key: 'tournamentHistory' }));
        }

        function handleSetSchedule(event) {
            event.preventDefault();
            const scheduleDate = document.getElementById('schedule-date').value;
            const scheduleTime = document.getElementById('schedule-time').value;

            if (!scheduleDate || !scheduleTime) {
                return alert('Please select both a date and a time for the schedule.');
            }

            const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
            localStorage.setItem('scoreboardDisplayUntil', scheduledDateTime.getTime());
            alert(`Scoreboard will be visible until: ${scheduledDateTime.toLocaleString()}`);
        }

        function saveMatchHistorySnapshot() {
            const currentTeamData = getTeamData();
            const matchDateInput = document.getElementById('match-date-input').value;
            const snapshotDate = matchDateInput || new Date().toISOString().slice(0, 10); // Use input date or current date

            const tournamentHistory = getTournamentHistory();
            const existingSnapshotIndex = tournamentHistory.findIndex(snapshot => snapshot.date === snapshotDate);

            if (existingSnapshotIndex > -1) {
                tournamentHistory[existingSnapshotIndex].teams = currentTeamData; // Update existing snapshot
                console.log('Updated scoreboard state for date:', snapshotDate, 'History:', tournamentHistory);
                alert('Scoreboard state for ' + snapshotDate + ' updated in Match History!');
            } else {
                tournamentHistory.push({ date: snapshotDate, teams: currentTeamData }); // Add new snapshot
                console.log('Saved new scoreboard state for date:', snapshotDate, 'History:', tournamentHistory);
                alert('Current scoreboard state saved to Match History!');
            }
            saveTournamentHistory(tournamentHistory);
        }

        function deleteMatchHistory(event) {
            event.preventDefault();
            const deleteDate = document.getElementById('delete-match-date').value;
            if (!deleteDate) {
                return alert('Please select a date to delete.');
            }

            if (confirm(`Are you sure you want to delete all match history for ${deleteDate}? This action cannot be undone.`)) {
                let tournamentHistory = getTournamentHistory();
                tournamentHistory = tournamentHistory.filter(snapshot => snapshot.date !== deleteDate);
                saveTournamentHistory(tournamentHistory);
                alert('Match history for ' + deleteDate + ' has been deleted.');
            }
        }

        function handleCreateTeam(event) {
            event.preventDefault();
            const newTeamName = document.getElementById('new-team-name').value.trim();
            if (!newTeamName) return alert('Team name cannot be empty.');
            const teamData = getTeamData();
            if (teamData.some(t => t.name.toLowerCase() === newTeamName.toLowerCase())) return alert('A team with this name already exists.');
            teamData.push({ name: newTeamName, matches: 0, kills: 0, points: 0, matchHistory: [] });
            saveTeamData(teamData);
            populateTeamSelects();
            event.target.reset();
            alert('Team created successfully!');
        }

        function handleDeleteTeam(event) {
            event.preventDefault();
            const teamNameToDelete = document.getElementById('delete-team-select').value;
            if (!teamNameToDelete) return alert('Please select a team to delete.');
            if (confirm(`Are you sure you want to delete ${teamNameToDelete}? This action cannot be undone.`)) {
                let teamData = getTeamData();
                teamData = teamData.filter(t => t.name !== teamNameToDelete);
                saveTeamData(teamData);
                populateTeamSelects();
                alert('Team deleted successfully!');
            }
        }

        function resetData() {
            if (confirm('Are you sure you want to reset all team scores?\n\nThis will set Matches, Kills, and Placement Points to 0 for all teams.\n\nThis action will NOT delete any teams or their match history.')) {
                const teamData = getTeamData();
                
                const resetTeamData = teamData.map(team => ({
                    ...team,
                    matches: 0,
                    kills: 0,
                    points: 0
                }));

                saveTeamData(resetTeamData);
                localStorage.removeItem('scoreboardDisplayUntil'); // Clear any scheduled time
                localStorage.removeItem('clearMainScoreboard'); // Clear the flag
                alert('All team scores have been reset to zero. Match history remains untouched.');
            }
        }

        populateTeamSelects();
        document.getElementById('update-form').addEventListener('submit', handleUpdate);
        document.getElementById('create-team-form').addEventListener('submit', handleCreateTeam);
        document.getElementById('delete-team-form').addEventListener('submit', handleDeleteTeam);
        document.getElementById('reset-button').addEventListener('click', resetData);
        document.getElementById('view-scoreboard-button').addEventListener('click', () => {
            window.open('index.html', '_blank');
        });
        document.getElementById('save-match-history-button').addEventListener('click', saveMatchHistorySnapshot);
        document.getElementById('delete-match-history-form').addEventListener('submit', deleteMatchHistory);

        let scheduleInterval;

        function checkSchedule() {
            const scheduledEndTime = localStorage.getItem('scoreboardDisplayUntil');
            const clearableDashboardContent = document.getElementById('clearable-dashboard-content');

            if (scheduledEndTime) {
                const now = new Date().getTime();
                if (now >= parseInt(scheduledEndTime, 10)) {
                    // Time is over, set flag for index.html to clear data
                    localStorage.setItem('clearMainScoreboard', 'true'); // Signal index.html to clear
                    localStorage.removeItem('scoreboardDisplayUntil'); // Clear the schedule
                    clearInterval(scheduleInterval);
                }
            }
        }

        document.getElementById('time-schedule-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const scheduleDateInput = document.getElementById('schedule-date');
            const scheduleTimeInput = document.getElementById('schedule-time');

            const dateValue = scheduleDateInput.value;
            const timeValue = scheduleTimeInput.value;

            if (dateValue && timeValue) {
                const scheduledDateTime = new Date(`${dateValue}T${timeValue}`);

                // Optional: If the scheduled time is in the past, alert the user or adjust
                const now = new Date();
                if (scheduledDateTime.getTime() < now.getTime()) {
                    alert('The scheduled time is in the past. Please select a future date and time.');
                    return;
                }

                localStorage.setItem('scoreboardDisplayUntil', scheduledDateTime.getTime());
                alert(`Website content will be cleared at: ${scheduledDateTime.toLocaleString()}`);
                // Start checking immediately and then every second
                clearInterval(scheduleInterval); // Clear any existing interval
                scheduleInterval = setInterval(checkSchedule, 1000);
                checkSchedule(); // Initial check
            } else {
                alert('Please select both a date and a time.');
            }
        });

        // Initial check when the page loads
        checkSchedule();
        // Set up interval to continuously check the schedule if one is active
        if (localStorage.getItem('scoreboardDisplayUntil')) {
            scheduleInterval = setInterval(checkSchedule, 1000);
        }
    }
});