const Tasker = require('../models/Tasker');

// Add a new tasker
exports.createTasker = async (req, res) => {
  try {
    const {
      fullName,
      profession,
      location,
      phone,
      rating,
      isAvailable,
      description
    } = req.body;

    let certificationUrl = '';
    let profilePicUrl = '';

    if (req.files['certification']) {
      certificationUrl = req.files['certification'][0].path;
    }

    if (req.files['profilePic']) {
      profilePicUrl = req.files['profilePic'][0].path;
    }

    const newTasker = new Tasker({
      fullName,
      profession,
      location,
      phone,
      rating: rating || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      certification: certificationUrl,
      profilePic: profilePicUrl,
      description
    });

    await newTasker.save();

    res.status(201).json({
      message: 'Tasker created successfully',
      tasker: newTasker
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all taskers
exports.getAllTaskers = async (req, res) => {
  try {
    const taskers = await Tasker.find();
    res.status(200).json(taskers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a tasker by ID 
exports.getTaskerByIdFromBody = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Tasker ID is required in the request body' });
    }

    const tasker = await Tasker.findById(id);

    if (!tasker) {
      return res.status(404).json({ message: 'Tasker not found' });
    }

    res.status(200).json(tasker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


