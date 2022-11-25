async function buildTracks (spotifyApi, tracks, size,userMood){

    let trackUris = [];   
    let mood;
    try{
        for(let i = 0; i < size; i++){
			console.log(tracks[i].name)
            await spotifyApi.getAudioFeaturesForTrack(tracks[i].id)
            .then(async function(data) {
                mood = await findMood(data.body);
                if(mood === userMood) {
                    trackUris.push(data.body.uri);
					console.log(data.body)
					console.log(mood)
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

	//valence
    if (attributes.valence >= 0.6) {
		sentiment++
	} else if (attributes.valence < .4) {
		sentiment = sentiment - 10
	} 
	else if (attributes.valence >= .7) {
		sentiment = sentiment + 10
	}
	else {
		sentiment--
	}
	//energy
	if (attributes.energy >= 0.6) {
		intensity = intensity + 2
	} else if (attributes.energy >= .7){
		intensity = intensity + 2
	}
	else if(attributes.energy <= .3 ){
		intensity = intensity - 2
	}
	else{
		intensity = intensity - 2
	}

	//tempo
	if (attributes.tempo >= 120) {
		sentiment = sentiment + 2
		intensity = intensity + 2
	} else if(attributes.tempo < 120 && attributes.tempo >= 100){
		//intensity--
		//sentiment--
	}
	else if(attributes.tempo < 100 && attributes.tempo > 90){
		sentiment = sentiment - 2
		intensity = intensity - 2
	}
	else{
		intensity = intensity - 4
	}

	//danceability
	if (attributes.danceability >= 0.5) {
		intensity++
		//sentiment++
	} else {
		intensity--
		//sentiment--
	}
	if (attributes.danceability >= .7) {
		intensity++
		//sentiment++
	}
	
	if (attributes.danceability < .3) {
		intensity--
		//sentiment--
	}
	
	//mode
	if(attributes.mode === 0){
		sentiment--
	} else{
		sentiment++
	}

	//loudness
	if (attributes.loudness <= -7.5) {
		intensity = intensity - 2
	}
	if (attributes.loudness > -7.5) {
		intensity = intensity + 2
	}
	if (attributes.loudness <= -10.0) {
		intensity = intensity - 1
	}
	if (attributes.loudness > -5.0) {
		intensity = intensity + 2
	}

	// calculate
	if (intensity >= 0) {
		if (sentiment > 0) {
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