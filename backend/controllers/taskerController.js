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


exports.getAllTaskers = async (req, res) => {
  try {
    // Get all taskers from the database
    const taskers = await Tasker.find().select(
      'fullName profession rating ratings profilePic description createdAt'
    );  
    // Format the data to match frontend expectations
    const formattedTaskers = taskers.map(tasker => ({
      name: tasker.fullName,
      profileImage: tasker.profilePic || 'https://randomuser.me/api/portraits/men/1.jpg', // default image
      rating: tasker.rating || 0,
      reviews: tasker.ratings?.length || 0,
      skills: tasker.profession,
      description: tasker.description || '',
      joinDate: tasker.createdAt ? tasker.createdAt.toISOString() : null, // Add joinDate
    }));
    res.status(200).json(formattedTaskers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getTopRatedTaskers = async (req, res) => {
  try {
    console.log('📌 getTopRatedTaskers called');

    // Sort taskers by rating in descending order
    const taskers = await Tasker.find()
      .sort({ rating: -1, reviews: -1 }) // first by rating, then reviews
      .limit(10); // limit results (you can change this)

    console.log('📊 Top Rated Taskers:', taskers);

    return res.status(200).json(taskers);
  } catch (error) {
    console.error('❌ Error in getTopRatedTaskers:', error);
    res.status(500).json({ message: 'Server error while fetching top rated taskers' });
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


