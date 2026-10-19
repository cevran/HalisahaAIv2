
let players = [];
let currentUserId = null;
let currentGroupId = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        currentUserId = user.id;

        const params = new URLSearchParams(window.location.search);
        currentGroupId = params.get('group_id');

        if (!currentGroupId) {
            alert('Grup bilgisi bulunamadı.');
            return;
        }

        await loadPlayersAndRatings();

        document
            .getElementById('saveRatingsBtn')
            .addEventListener('click', saveRatings);

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});

async function loadPlayersAndRatings() {

    const { data: members, error: memberError } = await supabaseClient
        .from('group_members')
        .select(`
            user_id,
            profiles (
                full_name,
                nickname
            )
        `)
        .eq('group_id', currentGroupId)
        .eq('active', true);

    if (memberError) throw memberError;

    const { data: ratings, error: ratingError } = await supabaseClient
        .from('player_ratings')
        .select('*')
        .eq('group_id', currentGroupId)
        .eq('rater_user_id', currentUserId);

    if (ratingError) throw ratingError;

    players = members
        .filter(m => m.user_id !== currentUserId)
        .map(member => {

            const existingRating = ratings.find(
                r => r.target_user_id === member.user_id
            );

            return {
                user_id: member.user_id,
                full_name:
                    member.profiles?.nickname ||
                    member.profiles?.full_name ||
                    'Oyuncu',
                rating: existingRating || {
                    condition_score: 3,
                    technique_score: 3,
                    attack_score: 3,
                    defense_score: 3,
                    teamplay_score: 3,
                    goalkeeper_score: 3,
                    captain_score: 3
                }
            };
        });

    renderPlayers();
}

function createStars(container, selectedValue, callback) {

    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {

        const star = document.createElement('span');

        star.className =
            i <= selectedValue
                ? 'star active'
                : 'star';

        star.innerHTML = '★';

        star.addEventListener('click', () => {

            callback(i);
            updateStars(container, i);

        });

        container.appendChild(star);
    }
}

function updateStars(container, value) {

    container
        .querySelectorAll('.star')
        .forEach((star, index) => {

            if (index < value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
}

function renderPlayers() {

    const container = document.getElementById('playersContainer');
    const template = document.getElementById('playerCardTemplate');

    container.innerHTML = '';

    players.forEach(player => {

        const clone = template.content.cloneNode(true);

        clone.querySelector('.player-name').textContent = player.full_name;

        clone.querySelectorAll('.star-rating').forEach(starContainer => {

            const field = starContainer.dataset.field;
            const value = player.rating[field] || 3;

            createStars(
                starContainer,
                value,
                newValue => {
                    player.rating[field] = newValue;
                }
            );
        });

        container.appendChild(clone);
    });
}

async function saveRatings() {

    try {

        const records = players.map(player => ({
            group_id: currentGroupId,
            rater_user_id: currentUserId,
            target_user_id: player.user_id,
            condition_score: player.rating.condition_score,
            technique_score: player.rating.technique_score,
            attack_score: player.rating.attack_score,
            defense_score: player.rating.defense_score,
            teamplay_score: player.rating.teamplay_score,
            goalkeeper_score: player.rating.goalkeeper_score,
            captain_score: player.rating.captain_score
        }));

        const { error } = await supabaseClient
            .from('player_ratings')
            .upsert(records, {
                onConflict: 'group_id,rater_user_id,target_user_id'
            });

        if (error) throw error;

        alert('Değerlendirmeler başarıyla kaydedildi.');

    } catch (err) {

        console.error(err);
        alert(err.message);
    }
}
