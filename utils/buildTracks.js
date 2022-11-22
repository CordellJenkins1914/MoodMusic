async function buildTracks (spotifyApi, tracks, size){

    let trackUris = [];   
    let mood;
    try{
        for(let i = 0; i < size; i++){
            spotifyApi.getAudioFeaturesForTrack(tracks[i].id)
            .then(async function(data) {
                mood = await findMood(data.body);
                if(mood == "angry") {
                    trackUris.push(data.body.uri);
                    console.log(data.body);
                    console.log(mood);
                }
            })
            .catch(function(err) {
                console.log('Something went wrong!', err);
            });
        }
        return trackUris;
    } catch (error){
        throw error;
    }
}

async function findMood(attributes) {

    let intensity = 0;
    let sentiment = 0;
    let mood;

    if (attributes.valence >= 0.5) {
		sentiment++
	} else if (attributes.valence < .3) {
		sentiment = sentiment - 4
	} else {
		sentiment--
	}

	if (attributes.energy >= 0.5) {
		intensity = intensity + 2
	} else {
		intensity = intensity - 2
	}

	if (attributes.tempo >= 130) {
		intensity++
		sentiment++
	} else {
		intensity--
		sentiment--
	}

	if (attributes.danceability >= 0.5) {
		intensity++
		sentiment++
	} else {
		intensity--
		sentiment--
	}

	if (intensity >= 0) {
		if (sentiment >= 0) {
			mood = "excited"
		} else {
			mood = "angry"
		}
	} else {
		if (sentiment <= 0) {
			mood = "sad"
		} else {
			mood = "happy"
		}
	}
    return mood;
}

export default buildTracks;