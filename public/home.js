  // Initialize the application when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Music System UI Initialized")
  
    // DOM Elements
    const audioPlayer = document.getElementById("audio-player")
    const playBtn = document.getElementById("play-btn")
    const muteBtn = document.getElementById("mute-btn")
    const progressBar = document.getElementById("progress-bar")
    const progressBarFill = document.getElementById("progress-bar-fill")
    const volumeSlider = document.getElementById("volume-slider")
    const volumeSliderFill = document.getElementById("volume-slider-fill")
    const currentTimeEl = document.getElementById("current-time")
    const durationEl = document.getElementById("duration")
    const likeBtn = document.getElementById("like-btn")
    const searchInput = document.getElementById("search-input")
    const prevBtn = document.getElementById("prev-btn")
    const nextBtn = document.getElementById("next-btn")
    const backToPlaylistsBtn = document.getElementById("back-to-playlists-btn")
    const currentPlaylistTitle = document.getElementById("current-playlist-title")
    const favoritesCount = document.getElementById("favorites-count")
    const recentCount = document.getElementById("recent-count")
    const allTracksContainer = document.getElementById("all-tracks")
    const addMusicBtn = document.getElementById("add-music-btn")
    const addToPlaylistBtn = document.getElementById("add-to-playlist-btn")
    const addPlaylistBtn = document.getElementById("add-playlist-btn")
    const fileUpload = document.getElementById("file-upload")
    const mobileNavToggle = document.getElementById("mobile-nav-toggle")
    const sidebar = document.getElementById("sidebar")
  
    // Modals
    const addToPlaylistModal = document.getElementById("add-to-playlist-modal")
    const createPlaylistModal = document.getElementById("create-playlist-modal")
    const closeModalBtns = document.querySelectorAll(".close-modal-btn")
    const createPlaylistBtn = document.querySelector(".create-playlist-btn")
    const playlistNameInput = document.getElementById("playlist-name")
    const playlistSelect = document.querySelector(".playlist-select")
  
    // Navigation buttons
    const homeBtn = document.getElementById("home-btn")
    const favoritesBtn = document.getElementById("favorites-btn")
    const recentBtn = document.getElementById("recent-btn")
    const playlistsBtn = document.getElementById("playlists-btn")
  
    // View containers
    const viewContents = document.querySelectorAll(".view-content")
    const homeView = document.getElementById("home-view")
    const playlistView = document.getElementById("playlist-view")
    const playlistsView = document.getElementById("playlists-view")
    const favoritesView = document.getElementById("favorites-view")
    const recentView = document.getElementById("recent-view")
  
    // Track lists
    const playlistTracks = document.getElementById("playlist-tracks")
    const favoritesTracks = document.getElementById("favorites-tracks")
    const recentTracksList = document.getElementById("recent-tracks")
  
    // Playlist cards container
    const playlistsGrid = document.querySelector(".playlists-grid")
  
    // State
    let isPlaying = false
    let isMuted = false
    let currentTrackIndex = 0
    let currentPlaylist = []
    let currentPlaylistName = ""
    let favorites = []
    let recentlyPlayed = []
    let currentView = "home"
    let allTracks = [] // Array to hold all tracks
    let isLoading = false // Track loading state for API calls
    let currentTrack = null // Current track being played
    let selectedTrackForPlaylist = null // Track selected to add to a playlist
    let isMobileMenuOpen = false // Track mobile menu state
  
    // Saavn API configuration
    const SAAVN_API_BASE_URL = "https://saavn.dev/api"
  
    // Playlists data structure
    let playlists = {
      workout: {
        name: "Workout Mix",
        tracks: []
      },
      chill: {
        name: "Chill Vibes",
        tracks: []
      },
      party: {
        name: "Party Time",
        tracks: []
      },
      focus: {
        name: "Focus Mode",
        tracks: []
      }
    }
  
    // Initialize the application
    function init() {
      // Initialize favorites and recently played from localStorage if available
      loadFavoritesFromStorage()
      loadRecentlyPlayedFromStorage()
      loadPlaylistsFromStorage()
  
      // Update counters
      updateCounters()
  
      // Set initial view
      switchView("home")
  
      // Fetch genre-specific tracks
      fetchGenreTracks()
  
      // Initialize playlist cards
      updatePlaylistCards()
  
      // Add loading indicator
      addLoadingIndicator()
      
      // Add mobile menu toggle functionality
      setupMobileNavigation()
    }
    
    // Setup mobile navigation
    function setupMobileNavigation() {
        if (mobileNavToggle) {
            mobileNavToggle.addEventListener("click", () => {
                isMobileMenuOpen = !isMobileMenuOpen
                if (isMobileMenuOpen) {
                    sidebar.classList.remove("mobile-hidden")
                    mobileNavToggle.innerHTML = '<i class="fas fa-times"></i>'
                } else {
                    sidebar.classList.add("mobile-hidden")
                    mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>'
                }
            })
            
            // Initially hide sidebar on mobile
            if (window.innerWidth <= 576) {
                sidebar.classList.add("mobile-hidden")
            }
            
            // Handle window resize
            window.addEventListener("resize", () => {
                if (window.innerWidth > 576) {
                    sidebar.classList.remove("mobile-hidden")
                } else if (!isMobileMenuOpen) {
                    sidebar.classList.add("mobile-hidden")
                }
            })
            
            // Close mobile menu when clicking on a view
            document.querySelectorAll(".playlist-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    if (window.innerWidth <= 576) {
                        sidebar.classList.add("mobile-hidden")
                        isMobileMenuOpen = false
                        mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>'
                    }
                })
            })
        }
    }
  
    // Add loading indicator to the UI
    function addLoadingIndicator() {
      const loadingIndicator = document.createElement("div")
      loadingIndicator.className = "loading-indicator"
      loadingIndicator.style.display = "none"
      document.body.appendChild(loadingIndicator)
    }
  
    // Show/hide loading indicator
    function showLoading(isLoadingState) {
      isLoading = isLoadingState
      const loadingIndicator = document.querySelector(".loading-indicator")
      if (loadingIndicator) {
        loadingIndicator.style.display = isLoadingState ? "block" : "none"
      }
    }
  
    // Fetch genre-specific tracks (Bhojpuri, Hindi, Haryanvi)
    async function fetchGenreTracks() {
      try {
        showLoading(true)
  
        // Fetch Hindi songs
        const hindiTracks = await fetchTracksByLanguage("hindi", 30)
        
        // Fetch Bhojpuri songs
        const bhojpuriTracks = await fetchTracksByLanguage("bhojpuri", 30)
        
        // Fetch Haryanvi songs
        const haryanviTracks = await fetchTracksByLanguage("haryanvi", 30)
  
        // Combine all tracks
        allTracks = [...hindiTracks, ...bhojpuriTracks, ...haryanviTracks]
  
        // Sort tracks alphabetically by title
        allTracks.sort((a, b) => a.title.localeCompare(b.title))
  
        // Set initial track if we have tracks
        if (allTracks.length > 0) {
          currentTrack = allTracks[0]
          updateTrackInfo(currentTrack)
        }
  
        // Initialize home view with all tracks
        initializeAllTracks()
  
        // Add some tracks to default playlists
        distributeTracksToPlaylists()
      } catch (error) {
        console.error("Error fetching genre tracks:", error)
      } finally {
        showLoading(false)
      }
    }
  
    // Fetch tracks by language
    async function fetchTracksByLanguage(language, limit = 10) {
      try {
        const url = `${SAAVN_API_BASE_URL}/search/songs?query=${language}&limit=${limit}`
        const response = await fetch(url)
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
  
        const data = await response.json()
  
        // Process the tracks from the API
        if (data.data && data.data.results) {
          return data.data.results.map((track) => {
            return {
              id: track.id,
              title: track.name,
              artist: track.primaryArtists || "Unknown Artist",
              album: track.album.name || "Unknown Album",
              duration: formatDuration(track.duration * 1000), // Convert seconds to milliseconds
              coverArt: track.image[2].url || "",
              downloadUrl: track.downloadUrl && track.downloadUrl[4] ? track.downloadUrl[4].url : null,
              language: language
            }
          })
        }
  
        return []
      } catch (error) {
        console.error(`Error fetching ${language} tracks:`, error)
        return []
      }
    }
  
    // Distribute tracks to playlists based on some criteria
    function distributeTracksToPlaylists() {
      // Clear existing tracks in playlists
      for (const key in playlists) {
        playlists[key].tracks = []
      }
  
      // Distribute tracks based on some criteria
      allTracks.forEach(track => {
        // For workout playlist - tracks with faster tempo (just a simulation)
        if (track.title.toLowerCase().includes("dance") || 
            track.title.toLowerCase().includes("beat") || 
            Math.random() < 0.25) {
          playlists.workout.tracks.push(track)
        }
        
        // For chill playlist - tracks with slower tempo
        if (track.title.toLowerCase().includes("love") || 
            track.title.toLowerCase().includes("romantic") || 
            Math.random() < 0.25) {
          playlists.chill.tracks.push(track)
        }
        
        // For party playlist - upbeat tracks
        if (track.title.toLowerCase().includes("party") || 
            track.title.toLowerCase().includes("dj") || 
            Math.random() < 0.25) {
          playlists.party.tracks.push(track)
        }
        
        // For focus playlist - instrumental or ambient tracks
        if (track.title.toLowerCase().includes("sad") || 
            track.title.toLowerCase().includes("emotional") || 
            Math.random() < 0.25) {
          playlists.focus.tracks.push(track)
        }
      })
  
      // Save playlists to localStorage
      savePlaylistsToStorage()
  
      // Update playlist cards
      updatePlaylistCards()
    }
  
    // Update playlist cards with track counts
    function updatePlaylistCards() {
      // Clear existing playlist cards
      playlistsGrid.innerHTML = ""
  
      // Add cards for each playlist
      for (const key in playlists) {
        const playlist = playlists[key]
        const card = document.createElement("div")
        card.className = "playlist-card"
        card.dataset.playlist = key
        card.innerHTML = `
          <div class="playlist-card-bg ${key}-bg"></div>
          <div class="playlist-card-content">
            <h3>${playlist.name}</h3>
            <p>${playlist.tracks.length} songs</p>
          </div>
        `
        playlistsGrid.appendChild(card)
  
        // Add click event to open the playlist
        card.addEventListener("click", () => {
          initializePlaylistTracks(key)
          switchView("playlist")
        })
      }
  
      // Update playlist options in the add to playlist modal
      updatePlaylistOptions()
    }
  
    // Update playlist options in the add to playlist modal
    function updatePlaylistOptions() {
      playlistSelect.innerHTML = ""
  
      for (const key in playlists) {
        const playlist = playlists[key]
        const option = document.createElement("div")
        option.className = "playlist-option"
        option.dataset.playlist = key
        option.innerHTML = `
          <div class="playlist-icon">
            <i class="fa-solid fa-music"></i>
          </div>
          <span>${playlist.name}</span>
        `
        playlistSelect.appendChild(option)
  
        // Add click event to add the track to this playlist
        option.addEventListener("click", () => {
          if (selectedTrackForPlaylist) {
            addTrackToPlaylist(selectedTrackForPlaylist, key)
            closeModal(addToPlaylistModal)
            selectedTrackForPlaylist = null
          }
        })
      }
    }
  
    // Add track to a playlist
    function addTrackToPlaylist(track, playlistKey) {
      // Check if track already exists in the playlist
      const exists = playlists[playlistKey].tracks.some(t => t.id === track.id)
      
      if (!exists) {
        playlists[playlistKey].tracks.push(track)
        savePlaylistsToStorage()
        updatePlaylistCards()
        
        // If we're currently viewing this playlist, refresh it
        if (currentView === "playlist" && currentPlaylistName === playlists[playlistKey].name) {
          initializePlaylistTracks(playlistKey)
        }
        
        // Show success message
        alert(`Added "${track.title}" to "${playlists[playlistKey].name}"`)
      } else {
        alert(`"${track.title}" is already in "${playlists[playlistKey].name}"`)
      }
    }
  
    // Create a new playlist
    function createNewPlaylist(name) {
      if (!name || name.trim() === "") {
        alert("Please enter a valid playlist name")
        return
      }
  
      // Generate a unique key for the playlist
      const key = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
  
      // Add the new playlist
      playlists[key] = {
        name: name,
        tracks: []
      }
  
      // Save to localStorage
      savePlaylistsToStorage()
  
      // Update UI
      updatePlaylistCards()
  
      // Show success message
      alert(`Playlist "${name}" created successfully`)
    }
  
    // Format duration from milliseconds to MM:SS
    function formatDuration(ms) {
      const totalSeconds = Math.floor(ms / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }
  
    // Load playlists from localStorage
    function loadPlaylistsFromStorage() {
      const storedPlaylists = localStorage.getItem("musicSystemPlaylists")
      if (storedPlaylists) {
        playlists = JSON.parse(storedPlaylists)
      }
    }
  
    // Save playlists to localStorage
    function savePlaylistsToStorage() {
      localStorage.setItem("musicSystemPlaylists", JSON.stringify(playlists))
    }
  
    // Load favorites from localStorage
    function loadFavoritesFromStorage() {
      const storedFavorites = localStorage.getItem("musicSystemFavorites")
      if (storedFavorites) {
        favorites = JSON.parse(storedFavorites)
      }
    }
  
    // Save favorites to localStorage
    function saveFavoritesToStorage() {
      localStorage.setItem("musicSystemFavorites", JSON.stringify(favorites))
    }
  
    // Load recently played from localStorage
    function loadRecentlyPlayedFromStorage() {
      const storedRecentlyPlayed = localStorage.getItem("musicSystemRecentlyPlayed")
      if (storedRecentlyPlayed) {
        recentlyPlayed = JSON.parse(storedRecentlyPlayed)
      }
    }
  
    // Save recently played to localStorage
    function saveRecentlyPlayedToStorage() {
      localStorage.setItem("musicSystemRecentlyPlayed", JSON.stringify(recentlyPlayed))
    }
  
    // Update counters for favorites and recently played
    function updateCounters() {
      favoritesCount.textContent = favorites.length
      recentCount.textContent = recentlyPlayed.length
    }
  
    // Initialize the home view with all tracks
    function initializeAllTracks() {
      allTracksContainer.innerHTML = ""
  
      if (allTracks.length === 0) {
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td colspan="4" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
            No tracks available
          </td>
        `
        allTracksContainer.appendChild(row)
        return
      }
  
      allTracks.forEach((track, index) => {
        const isLiked = favorites.some((fav) => fav.id === track.id)
  
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td class="track-num">${index + 1}</td>
          <td>
            <div class="track-title-container">
              <div class="track-image">
                <img src="${track.coverArt}" alt="${track.title}" onerror="this.src='https://via.placeholder.com/40'">
              </div>
              <div>
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
              </div>
            </div>
          </td>
          <td class="track-duration">${track.duration}</td>
          <td class="track-actions">
            <button class="track-action-btn like-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-heart ${isLiked ? "liked" : ""}"></i>
            </button>
            <button class="track-action-btn add-to-playlist-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-plus"></i>
            </button>
          </td>
        `
        allTracksContainer.appendChild(row)
  
        // Add click event to play the track
        row.addEventListener("click", (e) => {
          if (!e.target.closest(".track-action-btn")) {
            currentTrackIndex = index
            currentPlaylist = allTracks
            playTrack(track)
          }
        })
      })
  
      // Add like button functionality
      document.querySelectorAll("#all-tracks .like-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = btn.dataset.trackId
          toggleFavorite(trackId)
          // Update the heart icon immediately
          const heartIcon = btn.querySelector("i")
          const isLiked = favorites.some((fav) => fav.id === trackId)
          if (isLiked) {
            heartIcon.classList.add("liked")
          } else {
            heartIcon.classList.remove("liked")
          }
        })
      })
  
      // Add "add to playlist" button functionality
      document.querySelectorAll("#all-tracks .add-to-playlist-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = btn.dataset.trackId
          const track = allTracks.find(t => t.id === trackId)
          if (track) {
            selectedTrackForPlaylist = track
            openModal(addToPlaylistModal)
          }
        })
      })
    }
  
    // Initialize the playlist tracks
    function initializePlaylistTracks(playlistName) {
      if (!playlists[playlistName]) return
  
      currentPlaylist = playlists[playlistName].tracks
      currentPlaylistName = playlists[playlistName].name
      currentPlaylistTitle.textContent = currentPlaylistName
  
      playlistTracks.innerHTML = ""
  
      if (currentPlaylist.length === 0) {
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td colspan="4" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
            No tracks in this playlist yet
          </td>
        `
        playlistTracks.appendChild(row)
        return
      }
  
      currentPlaylist.forEach((track, index) => {
        const isLiked = favorites.some((fav) => fav.id === track.id)
  
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td class="track-num">${index + 1}</td>
          <td>
            <div class="track-title-container">
              <div class="track-image">
                <img src="${track.coverArt}" alt="${track.title}" onerror="this.src='https://via.placeholder.com/40'">
              </div>
              <div>
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
              </div>
            </div>
          </td>
          <td class="track-duration">${track.duration}</td>
          <td class="track-actions">
            <button class="track-action-btn like-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-heart ${isLiked ? "liked" : ""}"></i>
            </button>
            <button class="track-action-btn remove-from-playlist-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `
        playlistTracks.appendChild(row)
  
        // Add click event to play the track
        row.addEventListener("click", (e) => {
          if (!e.target.closest(".track-action-btn")) {
            currentTrackIndex = index
            playTrack(track)
          }
        })
      })
  
      // Add like button functionality
      document.querySelectorAll("#playlist-tracks .like-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = btn.dataset.trackId
          toggleFavorite(trackId)
          // Update the heart icon immediately
          const heartIcon = btn.querySelector("i")
          const isLiked = favorites.some((fav) => fav.id === trackId)
          if (isLiked) {
            heartIcon.classList.add("liked")
          } else {
            heartIcon.classList.remove("liked")
          }
        })
      })
  
      // Add remove from playlist button functionality
      document.querySelectorAll("#playlist-tracks .remove-from-playlist-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = btn.dataset.trackId
          removeTrackFromCurrentPlaylist(trackId)
        })
      })
    }
  
    // Remove track from current playlist
    function removeTrackFromCurrentPlaylist(trackId) {
      // Find the playlist key based on current playlist name
      let playlistKey = null
      for (const key in playlists) {
        if (playlists[key].name === currentPlaylistName) {
          playlistKey = key
          break
        }
      }
  
      if (playlistKey) {
        // Find the track index
        const trackIndex = playlists[playlistKey].tracks.findIndex(t => t.id === trackId)
        
        if (trackIndex !== -1) {
          // Remove the track
          playlists[playlistKey].tracks.splice(trackIndex, 1)
          
          // Save to localStorage
          savePlaylistsToStorage()
          
          // Refresh the playlist view
          initializePlaylistTracks(playlistKey)
          
          // Update playlist cards
          updatePlaylistCards()
        }
      }
    }
  
    // Initialize the favorites tracks
    function initializeFavoritesTracks() {
      favoritesTracks.innerHTML = ""
  
      if (favorites.length === 0) {
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td colspan="4" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
            No favorite tracks yet
          </td>
        `
        favoritesTracks.appendChild(row)
        return
      }
  
      favorites.forEach((track, index) => {
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td class="track-num">${index + 1}</td>
          <td>
            <div class="track-title-container">
              <div class="track-image">
                <img src="${track.coverArt}" alt="${track.title}" onerror="this.src='https://via.placeholder.com/40'">
              </div>
              <div>
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
              </div>
            </div>
          </td>
          <td class="track-duration">${track.duration}</td>
          <td class="track-actions">
            <button class="track-action-btn like-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-heart liked"></i>
            </button>
            <button class="track-action-btn add-to-playlist-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-plus"></i>
            </button>
          </td>
        `
        favoritesTracks.appendChild(row)
  
        // Add click event to play the track
        row.addEventListener("click", (e) => {
          if (!e.target.closest(".track-action-btn")) {
            currentTrackIndex = index
            currentPlaylist = favorites
            playTrack(track)
          }
        })
  
        // Add like button functionality
        const likeButton = row.querySelector(".like-btn")
        likeButton.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = likeButton.dataset.trackId
          toggleFavorite(trackId)
          initializeFavoritesTracks() // Refresh the favorites view
        })
  
        // Add "add to playlist" button functionality
        const addToPlaylistButton = row.querySelector(".add-to-playlist-btn")
        addToPlaylistButton.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = addToPlaylistButton.dataset.trackId
          const track = favorites.find(t => t.id === trackId)
          if (track) {
            selectedTrackForPlaylist = track
            openModal(addToPlaylistModal)
          }
        })
      })
    }
  
    // Initialize the recent tracks
    function initializeRecentTracks() {
      recentTracksList.innerHTML = ""
  
      if (recentlyPlayed.length === 0) {
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td colspan="4" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
            No recently played tracks
          </td>
        `
        recentTracksList.appendChild(row)
        return
      }
  
      recentlyPlayed.forEach((track, index) => {
        const isLiked = favorites.some((fav) => fav.id === track.id)
  
        const row = document.createElement("tr")
        row.className = "track-row"
        row.innerHTML = `
          <td class="track-num">${index + 1}</td>
          <td>
            <div class="track-title-container">
              <div class="track-image">
                <img src="${track.coverArt}" alt="${track.title}" onerror="this.src='https://via.placeholder.com/40'">
              </div>
              <div>
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
              </div>
            </div>
          </td>
          <td class="track-duration">${track.duration}</td>
          <td class="track-actions">
            <button class="track-action-btn like-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-heart ${isLiked ? "liked" : ""}"></i>
            </button>
            <button class="track-action-btn add-to-playlist-btn" data-track-id="${track.id}">
              <i class="fa-solid fa-plus"></i>
            </button>
          </td>
        `
        recentTracksList.appendChild(row)
  
        // Add click event to play the track
        row.addEventListener("click", (e) => {
          if (!e.target.closest(".track-action-btn")) {
            currentTrackIndex = index
            currentPlaylist = recentlyPlayed
            playTrack(track)
          }
        })
  
        // Add like button functionality
        const likeButton = row.querySelector(".like-btn")
        likeButton.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = likeButton.dataset.trackId
          toggleFavorite(trackId)
          // Update the heart icon immediately
          const heartIcon = likeButton.querySelector("i")
          const isLiked = favorites.some((fav) => fav.id === trackId)
          if (isLiked) {
            heartIcon.classList.add("liked")
          } else {
            heartIcon.classList.remove("liked")
          }
        })
  
        // Add "add to playlist" button functionality
        const addToPlaylistButton = row.querySelector(".add-to-playlist-btn")
        addToPlaylistButton.addEventListener("click", (e) => {
          e.stopPropagation()
          const trackId = addToPlaylistButton.dataset.trackId
          const track = recentlyPlayed.find(t => t.id === trackId)
          if (track) {
            selectedTrackForPlaylist = track
            openModal(addToPlaylistModal)
          }
        })
      })
    }
  
    // Toggle favorite status for a track
    function toggleFavorite(trackId) {
      const favoriteIndex = favorites.findIndex((track) => track.id === trackId)
  
      if (favoriteIndex === -1) {
        // Add to favorites
        let trackToAdd
  
        // Find the track in all tracks
        trackToAdd = allTracks.find((track) => track.id === trackId)
  
        if (trackToAdd) {
          favorites.push(trackToAdd)
        }
      } else {
        // Remove from favorites
        favorites.splice(favoriteIndex, 1)
      }
  
      // Update like button on main player if current track
      if (currentTrack && currentTrack.id === trackId) {
        const isLiked = favorites.some((fav) => fav.id === trackId)
        if (isLiked) {
          likeBtn.querySelector("i").classList.add("liked")
        } else {
          likeBtn.querySelector("i").classList.remove("liked")
        }
      }
  
      // Update like buttons in all views
      updateLikeButtonsInAllViews(trackId)
  
      // Save to localStorage and update counter
      saveFavoritesToStorage()
      updateCounters()
    }
  
    // Update like buttons in all views
    function updateLikeButtonsInAllViews(trackId) {
      const isLiked = favorites.some((fav) => fav.id === trackId)
  
      // Update in home view
      const homeButtons = document.querySelectorAll(`#all-tracks .like-btn[data-track-id="${trackId}"]`)
      homeButtons.forEach((btn) => {
        if (isLiked) {
          btn.querySelector("i").classList.add("liked")
        } else {
          btn.querySelector("i").classList.remove("liked")
        }
      })
  
      // Update in playlist view
      const playlistButtons = document.querySelectorAll(`#playlist-tracks .like-btn[data-track-id="${trackId}"]`)
      playlistButtons.forEach((btn) => {
        if (isLiked) {
          btn.querySelector("i").classList.add("liked")
        } else {
          btn.querySelector("i").classList.remove("liked")
        }
      })
  
      // Update in recent view
      const recentButtons = document.querySelectorAll(`#recent-tracks .like-btn[data-track-id="${trackId}"]`)
      recentButtons.forEach((btn) => {
        if (isLiked) {
          btn.querySelector("i").classList.add("liked")
        } else {
          btn.querySelector("i").classList.remove("liked")
        }
      })
    }
  
    // Add track to recently played
    function addToRecentlyPlayed(track) {
      // Remove if already in the list
      const existingIndex = recentlyPlayed.findIndex((t) => t.id === track.id)
      if (existingIndex !== -1) {
        recentlyPlayed.splice(existingIndex, 1)
      }
  
      // Add to the beginning of the array
      recentlyPlayed.unshift(track)
  
      // Limit to 20 tracks
      if (recentlyPlayed.length > 20) {
        recentlyPlayed.pop()
      }
  
      // Save to localStorage and update counter
      saveRecentlyPlayedToStorage()
      updateCounters()
    }
  
    // Play a track
    function playTrack(track) {
      currentTrack = track
      updateTrackInfo(track)
  
      // Set the audio source to the track's audio file
      if (track.downloadUrl) {
        // If we already have the download URL, use it directly
        audioPlayer.src = track.downloadUrl
        audioPlayer
          .play()
          .then(() => {
            isPlaying = true
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
            playBtn.classList.add("playing")
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
          })
      } else {
        // For tracks without a download URL, use a sample audio
        audioPlayer.src = `https://assets.codepen.io/217233/${Math.floor(Math.random() * 5) + 1}.mp3`
  
        // Start playing
        audioPlayer
          .play()
          .then(() => {
            isPlaying = true
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
            playBtn.classList.add("playing")
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
          })
      }
  
      // Add to recently played
      addToRecentlyPlayed(track)
  
      // If we're in the recently played view, refresh it
      if (currentView === "recent") {
        initializeRecentTracks()
      }
    }
  
    // Play next track
    function playNextTrack() {
      if (currentPlaylist.length === 0) return
  
      currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length
      playTrack(currentPlaylist[currentTrackIndex])
    }
  
    // Play previous track
    function playPreviousTrack() {
      if (currentPlaylist.length === 0) return
  
      currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length
      playTrack(currentPlaylist[currentTrackIndex])
    }
  
    // Format time in seconds to MM:SS format
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }
  
    // Update track information
    function updateTrackInfo(track) {
      document.getElementById("track-title").textContent = track.title
      document.getElementById("track-artist").textContent = track.artist
      document.getElementById("track-album").textContent = track.album
      document.getElementById("cover-art").src = track.coverArt
  
      // Update like button
      const isLiked = favorites.some((fav) => fav.id === track.id)
      if (isLiked) {
        likeBtn.querySelector("i").classList.add("liked")
      } else {
        likeBtn.querySelector("i").classList.remove("liked")
      }
    }
  
    // Toggle play/pause
    function togglePlay() {
      if (audioPlayer.paused) {
        audioPlayer
          .play()
          .then(() => {
            isPlaying = true
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
            playBtn.classList.add("playing")
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
          })
      } else {
        audioPlayer.pause()
        isPlaying = false
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
        playBtn.classList.remove("playing")
      }
    }
  
    // Toggle mute
    function toggleMute() {
      audioPlayer.muted = !audioPlayer.muted
      isMuted = audioPlayer.muted
  
      if (isMuted) {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
        volumeSlider.value = 0
        volumeSliderFill.style.width = "0%"
      } else {
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
        volumeSlider.value = audioPlayer.volume * 100
        volumeSliderFill.style.width = `${audioPlayer.volume * 100}%`
      }
    }
  
    // Toggle like for current track
    function toggleLikeCurrentTrack() {
      if (currentTrack) {
        toggleFavorite(currentTrack.id)
      }
    }
  
    // Switch view
    function switchView(viewName) {
      currentView = viewName
  
      // Update view content
      viewContents.forEach((view) => {
        view.classList.remove("active")
      })
  
      // Update sidebar buttons
      document.querySelectorAll(".playlist-btn").forEach((btn) => {
        btn.classList.remove("active")
      })
  
      // Set active view and button
      if (viewName === "home") {
        homeView.classList.add("active")
        homeBtn.classList.add("active")
        initializeAllTracks() // Make sure all tracks are loaded
      } else if (viewName === "playlist") {
        playlistView.classList.add("active")
      } else if (viewName === "playlists") {
        playlistsView.classList.add("active")
        playlistsBtn.classList.add("active")
      } else if (viewName === "favorites") {
        favoritesView.classList.add("active")
        favoritesBtn.classList.add("active")
        initializeFavoritesTracks()
      } else if (viewName === "recent") {
        recentView.classList.add("active")
        recentBtn.classList.add("active")
        initializeRecentTracks()
      }
    }
  
    // Open modal
    function openModal(modal) {
      modal.classList.add("active")
    }
  
    // Close modal
    function closeModal(modal) {
      modal.classList.remove("active")
    }
  
    // Search tracks using Saavn API
    async function searchTracks(query) {
      if (!query || query.trim() === "") return []
  
      try {
        showLoading(true)
  
        const url = `${SAAVN_API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}`
        const response = await fetch(url)
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
  
        const data = await response.json()
  
        // Process the search results
        if (data.data && data.data.results) {
          return data.data.results.map((track) => {
            return {
              id: track.id,
              title: track.name,
              artist: track.primaryArtists || "Unknown Artist",
              album: track.album.name || "Unknown Album",
              duration: formatDuration(track.duration * 1000), // Convert seconds to milliseconds
              coverArt: track.image[2].url || "",
              downloadUrl: track.downloadUrl && track.downloadUrl[4] ? track.downloadUrl[4].url : null
            }
          })
        }
  
        return []
      } catch (error) {
        console.error("Error searching tracks:", error)
        return []
      } finally {
        showLoading(false)
      }
    }
  
    // Audio player event listeners
    audioPlayer.addEventListener("timeupdate", () => {
      const currentTime = audioPlayer.currentTime
      const duration = audioPlayer.duration || 237 // Fallback to 3:57 if duration is not available
  
      // Update progress bar and time display
      const progress = (currentTime / duration) * 100
      progressBar.value = progress
      progressBarFill.style.width = `${progress}%`
      currentTimeEl.textContent = formatTime(currentTime)
      durationEl.textContent = formatTime(duration)
    })
  
    audioPlayer.addEventListener("ended", () => {
      // Play next track when current track ends
      playNextTrack()
    })
  
    audioPlayer.addEventListener("loadedmetadata", () => {
      // Update duration display when metadata is loaded
      durationEl.textContent = formatTime(audioPlayer.duration)
    })
  
    // Event Listeners
    playBtn.addEventListener("click", togglePlay)
    muteBtn.addEventListener("click", toggleMute)
    likeBtn.addEventListener("click", toggleLikeCurrentTrack)
    prevBtn.addEventListener("click", playPreviousTrack)
    nextBtn.addEventListener("click", playNextTrack)
    backToPlaylistsBtn.addEventListener("click", () => switchView("playlists"))
  
    // Navigation buttons
    homeBtn.addEventListener("click", () => switchView("home"))
    favoritesBtn.addEventListener("click", () => switchView("favorites"))
    recentBtn.addEventListener("click", () => switchView("recent"))
    playlistsBtn.addEventListener("click", () => switchView("playlists"))
  
    // Add music button
    addMusicBtn.addEventListener("click", () => {
      fileUpload.click()
    })
  
    // Add to playlist button in playlist view
    addToPlaylistBtn.addEventListener("click", () => {
      if (currentPlaylist.length > 0) {
        selectedTrackForPlaylist = currentPlaylist[currentTrackIndex]
        openModal(addToPlaylistModal)
      } else {
        alert("No track selected")
      }
    })
  
    // Add playlist button
    addPlaylistBtn.addEventListener("click", () => {
      openModal(createPlaylistModal)
    })
  
    // Close modal buttons
    closeModalBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal")
        closeModal(modal)
      })
    })
  
    // Create playlist button
    createPlaylistBtn.addEventListener("click", () => {
      const playlistName = playlistNameInput.value
      createNewPlaylist(playlistName)
      playlistNameInput.value = ""
      closeModal(createPlaylistModal)
    })
  
    // File upload change event
    fileUpload.addEventListener("change", (e) => {
      const files = e.target.files
      if (files.length > 0) {
        handleFileUpload(files)
      }
    })
  
    // Handle file upload
    function handleFileUpload(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create a URL for the audio file
        const audioUrl = URL.createObjectURL(file)
        
        // Create a new track object
        const newTrack = {
          id: "local-" + Date.now() + "-" + i,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          artist: "Local File",
          album: "My Uploads",
          duration: "0:00", // Will be updated when loaded
          coverArt: "https://via.placeholder.com/400",
          downloadUrl: audioUrl,
          isLocalFile: true
        }
        
        // Add to all tracks
        allTracks.push(newTrack)
        
        // Update the UI
        initializeAllTracks()
        
        // Ask which playlist to add to
        selectedTrackForPlaylist = newTrack
        openModal(addToPlaylistModal)
      }
      
      // Reset the file input
      fileUpload.value = ""
    }
  
    // Search functionality
    let searchTimeout
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase()
  
      // Clear previous timeout
      clearTimeout(searchTimeout)
  
      if (searchTerm.length === 0) {
        // If search is cleared, return to home view
        if (currentView !== "home") {
          switchView("home")
        }
        return
      }
  
      // Set a timeout to avoid making API calls on every keystroke
      searchTimeout = setTimeout(async () => {
        // Search using Saavn API
        const apiResults = await searchTracks(searchTerm)
  
        // Also search local tracks
        const localResults = allTracks.filter(
          (track) =>
            track.title.toLowerCase().includes(searchTerm) ||
            track.artist.toLowerCase().includes(searchTerm) ||
            track.album.toLowerCase().includes(searchTerm)
        )
  
        // Combine results, prioritizing API results
        const searchResults = [...apiResults]
  
        // Add local results that aren't duplicates
        localResults.forEach((localTrack) => {
          if (
            !searchResults.some(
              (apiTrack) => apiTrack.title === localTrack.title && apiTrack.artist === localTrack.artist
            )
          ) {
            searchResults.push(localTrack)
          }
        })
  
        // Update playlist view with search results
        playlistTracks.innerHTML = ""
        currentPlaylistTitle.textContent = `Search Results: "${searchTerm}"`
        currentPlaylist = searchResults
  
        if (searchResults.length === 0) {
          const row = document.createElement("tr")
          row.className = "track-row"
          row.innerHTML = `
            <td colspan="4" style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">
              No tracks found matching "${searchTerm}"
            </td>
          `
          playlistTracks.appendChild(row)
        } else {
          searchResults.forEach((track, index) => {
            const isLiked = favorites.some((fav) => fav.id === track.id)
  
            const row = document.createElement("tr")
            row.className = "track-row"
            row.innerHTML = `
              <td class="track-num">${index + 1}</td>
              <td>
                <div class="track-title-container">
                  <div class="track-image">
                    <img src="${track.coverArt}" alt="${track.title}" onerror="this.src='https://via.placeholder.com/40'">
                  </div>
                  <div>
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                  </div>
                </div>
              </td>
              <td class="track-duration">${track.duration}</td>
              <td class="track-actions">
                <button class="track-action-btn like-btn" data-track-id="${track.id}">
                  <i class="fa-solid fa-heart ${isLiked ? "liked" : ""}"></i>
                </button>
                <button class="track-action-btn add-to-playlist-btn" data-track-id="${track.id}">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </td>
            `
            playlistTracks.appendChild(row)
  
            // Add click event to play the track
            row.addEventListener("click", (e) => {
              if (!e.target.closest(".track-action-btn")) {
                currentTrackIndex = index
                currentPlaylist = searchResults
                playTrack(track)
              }
            })
  
            // Add like button functionality
            const likeButton = row.querySelector(".like-btn")
            likeButton.addEventListener("click", (e) => {
              e.stopPropagation()
              const trackId = likeButton.dataset.trackId
              toggleFavorite(trackId)
              // Update the heart icon immediately
              const heartIcon = likeButton.querySelector("i")
              const isLiked = favorites.some((fav) => fav.id === trackId)
              if (isLiked) {
                heartIcon.classList.add("liked")
              } else {
                heartIcon.classList.remove("liked")
              }
            })
  
            // Add "add to playlist" button functionality
            const addToPlaylistButton = row.querySelector(".add-to-playlist-btn")
            addToPlaylistButton.addEventListener("click", (e) => {
              e.stopPropagation()
              const trackId = addToPlaylistButton.dataset.trackId
              const track = searchResults.find(t => t.id === trackId)
              if (track) {
                selectedTrackForPlaylist = track
                openModal(addToPlaylistModal)
              }
            })
          })
        }
  
        // Switch to playlist view to show search results
        switchView("playlist")
      }, 500) // Wait 500ms after user stops typing
    })
  
    // Progress bar interaction
    progressBar.addEventListener("input", () => {
      const seekTime = (progressBar.value / 100) * (audioPlayer.duration || 237)
      currentTimeEl.textContent = formatTime(seekTime)
      progressBarFill.style.width = `${progressBar.value}%`
    })
  
    progressBar.addEventListener("change", () => {
      const seekTime = (progressBar.value / 100) * (audioPlayer.duration || 237)
      audioPlayer.currentTime = seekTime
    })
  
    // Volume slider interaction
    volumeSlider.addEventListener("input", () => {
      const volume = volumeSlider.value / 100
      audioPlayer.volume = volume
      volumeSliderFill.style.width = `${volumeSlider.value}%`
  
      if (volume === 0) {
        audioPlayer.muted = true
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
        isMuted = true
      } else {
        audioPlayer.muted = false
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
        isMuted = false
      }
    })
  
    // Initialize the application
    init()
})