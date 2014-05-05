// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Global accessor that the popup uses.

chrome.runtime.onConnect.addListener(function(port) {
  // response to shortcut
  port.onMessage.addListener(function(msg) {
    console.log('connected');
  });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  // var url = "http://alexoriginal.duapp.com/?url=";
  var url = "http://localhost:5000/parse/jd";
  var cb = function(data) {
    sendResponse(data);
  };
  if (msg.type === "price") {
    jQuery.ajax({
      url: url,
      type: 'GET',
      cache: true,
      success: cb,
      error: function(er) {
        console.log('request error: ', er);
      }
    });
  }
  return true;
});

