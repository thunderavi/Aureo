// src/routes/playlists.js
const express = require('express');
const router = express.Router();
const { 
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} = require('../controllers/playlistController');
const { isAuthenticated } = require('../middleware/auth');

// All routes are protected
router.use(isAuthenticated);

router.get('/my', getMyPlaylists);

router.route('/')
  .post(createPlaylist)
  .get(getMyPlaylists);

router.route('/:id')
  .get(getPlaylistById)
  .put(updatePlaylist)
  .delete(deletePlaylist);

router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

module.exports = router;
