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

router.post('/callHistory', auth, async (req, res) => {

  try {
    let { outgoing_no, outgoing_name, name, phone_number } = req.body;

    await CallDetails.findOne({ name: outgoing_name }, async (err, contact) => {
      if (contact) {
        await CallDetails.updateOne({ name: outgoing_name }, { Incomingcall_Count: contact.Incomingcall_Count + 1 });

      }
      else {
        res.status(400)
      }
    });
    await CallDetails.findOne({ name }, async (err, contact) => {
      if (contact) {
        await CallDetails.updateOne({ name: name }, { outgoingcall_Count: contact.outgoingcall_Count + 1 });
      } else {
        res.status(400)
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

router.post('/createContact', auth, [
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


router.put('/updateContact/:contactId', auth, [
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

router.delete('/deleteContact/:contactId', auth, async (req, res) => {
  try {

    let customer = await CallDetails.findByIdAndRemove(req.params.contactId);
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

router.get('/allContact', auth, async (req, res) => {

  try {
    let contact = await CallDetails.find();
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

module.exports = router;
