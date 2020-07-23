const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
// bring in normalize to give us a proper url, regardless of what user entered
const normalize = require('normalize-url');

const CallDetails = require('../../models/CallDetails');
const User = require('../../models/User');
const { route } = require('./users');


// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private

router.post('/callHistory', async (req, res) => {

  try {
    let { outgoing_no, outgoing_name, name, phone_number } = req.body;

    await CallDetails.findOne({ name: outgoing_name }, async (err, contact) => {
      console.log(contact)
      if (contact) {
        await CallDetails.updateOne({ name: outgoing_name }, { Incomingcall_Count: contact.Incomingcall_Count + 1 });

      }
      else {
        res.status(400).json({
          "message": "Something went wrong"
        });
      }
    });
    await CallDetails.findOne({ name }, async (err, contact) => {
      if (contact) {
        console.log(contact)
        await CallDetails.updateOne({ name: name }, { outgoingcall_Count: contact.outgoingcall_Count + 1 });
      } else {
        res.status(400).json({
          "message": "Something went wrong"
        });
      }

    });
    res.status(201).json({
      success: true,
      message: "you have been called",
      errors: []
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }


})

router.post('/createcontact', [
  check('name', 'Please Enter a name').isAlphanumeric(),
  check(
    'number',
    'Please enter a phonenumber with  more than 6 '
  ).isLength({ min: 6 }),

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, number, location } = req.body;
  try {
    let contact = await CallDetails.findOne({ name });

    if (contact) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Contact already exists Please' }] });
    }
    contact = new CallDetails({
      name, number, location
    });

    await contact.save();
    res.status(201).json({
      success: true,
      message: "Contacts is  created!",
      errors: []
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }

})


router.put('/updatecontact/:contactId', [
  check('name', 'Please Enter a name').notEmpty(),
  check(
    'number',
    'Please enter a phonenumber with  more than 6 '
  ).isLength({ min: 6 }),
  check("location", 'Please enter a phonenumber with  more than 6 ').notEmpty()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // const { customerId } = req.params;

    let customer = await CallDetails.findByIdAndUpdate(req.params.contactId, req.body);
    console.log(customer)
    if (!customer) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Contact already exists Please' }] });
    } else {
      res.status(201).json({
        success: true,
        message: "Contacts is updated!",
        errors: []
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }

})

router.delete('/deleteContact/:contactId', async (req, res) => {
  try {
    // const { customerId } = req.params;

    let customer = await CallDetails.findByIdAndRemove(req.params.contactId);
    console.log(customer)
    if (!customer) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Contact already exists Please' }] });
    } else {
      res.status(201).json({
        success: true,
        message: "Contacts is Delete successful",
        errors: []
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }

})

router.get('/allcontact', async (req, res) => {

  try {
    let contact = await CallDetails.find();
    console.log(contact)
    if (contact.length == 0) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'No contact to read' }] });
    } else {
      res.status(201).json({
        success: true,
        message: contact,
        errors: []
      });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }

})

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['firstName', 'lastName', 'email']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const profileFields = {
    user: req.user.id,
  };

  try {
    // Using upsert option (creates new doc if no match is found):
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    );

    res.status(201).json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}
);

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name']);

    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
