// src/controllers/playlistController.js
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const { createError, formatSongsResponse } = require('../utils/helpers');

// @desc    Create new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, songs, isPublic } = req.body;

    const playlist = await Playlist.create({
      name,
      description,
      user: req.user._id,
      songs: songs || [],
      isPublic: isPublic || false
    });

    res.status(201).json({
      success: true,
      message: 'Playlist created successfully',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user playlists
// @route   GET /api/playlists/my
// @access  Private
const getMyPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: playlists.length,
      playlists
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single playlist by ID
// @route   GET /api/playlists/:id
// @access  Private
const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: 'songs',
        populate: { path: 'uploadedBy', select: 'username' }
      })
      .populate('user', 'username');

    if (!playlist) {
      return next(createError('Playlist not found', 404));
    }

    // Check access
    if (!playlist.isPublic && playlist.user._id.toString() !== req.user._id.toString()) {
      return next(createError('Access denied', 403));
    }

    // Format songs in playlist
    const formattedSongs = formatSongsResponse(playlist.songs);
    const playlistObj = playlist.toObject();
    playlistObj.songs = formattedSongs;

    res.status(200).json({
      success: true,
      playlist: playlistObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Private
const updatePlaylist = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    let playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(createError('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to update this playlist', 403));
    }

    playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { name, description, isPublic },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(createError('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to delete this playlist', 403));
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add song to playlist
// @route   POST /api/playlists/:id/songs
// @access  Private
const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return next(createError('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to modify this playlist', 403));
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return next(createError('Song not found', 404));
    }

    // Check if song already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({
        success: false,
        message: 'Song already in playlist'
      });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Song added to playlist',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove song from playlist
// @route   DELETE /api/playlists/:id/songs/:songId
// @access  Private
const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { id, songId } = req.params;
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return next(createError('Playlist not found', 404));
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to modify this playlist', 403));
    }

    playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
    await playlist.save();

    res.status(200).json({
      success: true,
      message: 'Song removed from playlist',
      playlist
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
};
