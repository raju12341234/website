document.addEventListener('DOMContentLoaded', () => {
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

    function calculateTotalPoints(team) { 
        return team.points + team.kills; 
    }

    function renderTable() {
        console.log("renderTable called.");
        const teamData = getTeamData();
        console.log("Team data for rendering:", teamData);
        teamData.sort((a, b) => calculateTotalPoints(b) - calculateTotalPoints(a));
        const tableBody = document.querySelector('#points-table tbody');
        tableBody.innerHTML = '';
        if (teamData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No teams in the tournament. Add teams from the dashboard.</td></tr>';
            return;
        }
        teamData.forEach((team, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td class="rank">${index + 1}</td>
                    <td class="team-name">${team.name}</td>
                    <td>${team.matches}</td>
                    <td>${team.kills}</td>
                    <td>${team.points}</td>
                    <td class="total-points">${calculateTotalPoints(team)}</td>
                </tr>
            `;
        });
    }

    window.addEventListener('storage', renderTable);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            renderTable();
        }
    });
    window.addEventListener('focus', renderTable);

    function getTournamentHistory() {
        const history = localStorage.getItem('tournamentHistory');
        return history ? JSON.parse(history) : [];
    }

    document.getElementById('refresh-button').addEventListener('click', renderTable);

    document.getElementById('main-search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const searchDate = document.getElementById('main-search-date').value;
        if (!searchDate) return;

        const tournamentHistory = getTournamentHistory();
        const resultsContainer = document.getElementById('main-search-results');
        resultsContainer.innerHTML = '';

        const snapshotOnDate = tournamentHistory.find(snapshot => snapshot.date === searchDate);

        if (!snapshotOnDate) {
            resultsContainer.innerHTML = '<p>No matches found for this date.</p>';
            return;
        }

        const teamsForDate = snapshotOnDate.teams;
        teamsForDate.sort((a, b) => (b.kills + b.points) - (a.kills + a.points));

        let tableHTML = '<h3>Scoreboard for ' + searchDate + '</h3>';
        tableHTML += '<table><thead><tr><th>Rank</th><th class="team-name">Team Name</th><th>Kills</th><th>Placement Pts</th><th>Total</th></tr></thead><tbody>';
        teamsForDate.forEach((team, index) => {
            const totalPoints = team.kills + team.points;
            tableHTML += `
                <tr>
                    <td class="rank">${index + 1}</td>
                    <td class="team-name">${team.name}</td>
                    <td>${team.kills}</td>
                    <td>${team.points}</td>
                    <td class="total-points">${totalPoints}</td>
                </tr>
            `;
        });
        tableHTML += '</tbody></table>';
        resultsContainer.innerHTML = tableHTML;
    });

    function clearTournamentData() {
        localStorage.setItem('tournamentData', JSON.stringify([])); // Set to empty array
        localStorage.removeItem('clearMainScoreboard'); // Remove the flag after clearing
        renderTable(); // Re-render the table to reflect the cleared data
    }

    function checkScoreboardVisibility() {
        const scoreboardDisplayUntil = localStorage.getItem('scoreboardDisplayUntil');
        const clearMainScoreboardFlag = localStorage.getItem('clearMainScoreboard');
        const pointsTable = document.getElementById('points-table');
        const scoreboardMessage = document.getElementById('scoreboard-message');

        if (clearMainScoreboardFlag === 'true') {
            clearTournamentData();
            if (pointsTable) pointsTable.style.display = 'none';
            if (scoreboardMessage) {
                scoreboardMessage.style.display = 'block';
                scoreboardMessage.innerHTML = '<p>Scoreboard content has been cleared as per schedule.</p>';
            }
            return; // Exit, as content is cleared
        }

        if (scoreboardDisplayUntil) {
            const scheduledTime = parseInt(scoreboardDisplayUntil, 10);
            const currentTime = new Date().getTime();

            if (currentTime >= scheduledTime) {
                if (pointsTable) pointsTable.style.display = 'none';
                if (scoreboardMessage) {
                    scoreboardMessage.style.display = 'block';
                    scoreboardMessage.innerHTML = '<p>Scoreboard is currently not visible.</p>';
                }
            } else {
                if (pointsTable) pointsTable.style.display = 'table';
                if (scoreboardMessage) scoreboardMessage.style.display = 'none';
            }
        } else {
            if (pointsTable) pointsTable.style.display = 'table';
            if (scoreboardMessage) scoreboardMessage.style.display = 'none';
        }
    }

    // Initial check and periodic check
    checkScoreboardVisibility();
    setInterval(checkScoreboardVisibility, 60 * 1000); // Check every minute

    renderTable();
});