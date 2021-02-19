// For recording successes and counting the score
function recordSuccess(newtrial) {
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/record_successes.php",
        data: "doset=TRUE&trial=" + newtrial,
        datatype: "text",
        error: function(data) {
            alert("Sorry, the server failed to record that you won!");
        }
    });
};

function countSuccesses() {
    var nsuc = 0;
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/record_successes.php",
        data: "doset=FALSE&trial=",
        datatype: "text",
        success: function(data) {
            nsuc = parseInt(data);
        },
        error: function(data) {
            alert("Error getting the score!");
        }
    });
    return nsuc;
};

// For keeping a persistent name around
function recordName() {
    var name = '';
    while (name === '') {
        name = prompt("What is your name?");
    }
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/get_name.php",
        data: "doset=TRUE&name="+name,
        error: function(data) {
            alert("Your name has not been set!");
        }
    });
    return name;
};

function getName() {
    var name = '';
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/get_name.php",
        data: "doset=FALSE&name=",
        success: function(data) {
            name = data;
        },
        error: function(data) {
            alert("Cannot load name!");
        }
    });
    if (name === '') {
        return recordName();
    }
    return name;
};

function getFlag() {
  var flag = '';
  $.ajax({
      type: "POST",
      async: false,
      url: "phpcmd/get_flag.php",
      data: "doset=FALSE&name=",
      success: function(data) {
          flag = data;
      },
      error: function(data) {
          alert("Cannot load flag!");
      }
  });
  if (name === '') {
      flag = "";
  }
  return flag;
}

// For pulling level information out from the database
function getTrial(trnm) {
    var trdat = '';
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/load_trial.php",
        data: "trialname=" + trnm,
        success: function(data) {
            trdat = data;
        },
    });
    if (trdat === '') {
        return null;
    } else if (trdat === 'Error: Empty or non-unique trial found') {
        return "Err:NonEmpty";
    } else {
        return JSON.parse(trdat);
    }
};

// Allow level submission
function submitForm(trname, creator, pw, jsn) {
    if (trname === '') {
        alert("You must name the level");
        return false;
    }
    if (creator === '') {
        alert("You must provide your own name");
        return false;
    }
    if (pw === '') {
        alert("A password is needed to submit your level");
        return false
    }

    var cont = false;
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/save_trial.php",
        data: "trialname="+trname+"&author="+creator+"&trialdata="+jsn+"&password="+pw,
        dataType: "text",
        success: function(data) {
            if (data === "New record created successfully") {
                cont = true;
            }
        },
        error: function(data){
            alert("Failed to load save data page");
        }
    });

    return cont;
};

// Helpers to pass worker approval back and forth from psiturk / scripts
function approveWorker(wid) {
    if (wid === '') {
        alert("Error: Worker ID not provided");
        return false;
    }
    var ret = false;
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/validate_workers.php",
        data: "id=" + wid + "&action=add",
        dataType: "text",
        success: function(data) {
            if (data === "Worker added") {
                ret = true;
            } else {
                console.log(data);
            }
        },
        error: function(data) {
            alert("Failed to load worker approval");
        }
    });
    return ret;
};

function checkApproval(wid) {
    if (wid === '') {
        alert("Error: Worker ID not provided");
        return false;
    }
    var ret = false;
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/validate_workers.php",
        data: "id=" + wid + "&action=query",
        dataType: "text",
        success: function(data) {
            if (data === "Approved") {
                ret = true;
            } else {
                console.log(data);
            }
        },
        error: function(data) {
            alert("Failed to load worker query");
        }
    });
    return ret;
};

function removeApproval(wid) {
    if (wid === '') {
        alert("Error: Worker ID not provided");
        return false;
    }
    var ret = false;
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/validate_workers.php",
        data: "id=" + wid + "&action=delete",
        dataType: "text",
        success: function(data) {
            if (data === "Worker deleted") {
                ret = true;
            } else {
                console.log(data);
            }
        },
        error: function(data) {
            alert("Failed to load worker query");
        }
    });
    return ret;
};

// Helpers to have intermediate progress in an experiment
function setExperimentProgress(progress, trials, score) {
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/set_progress.php",
        data: "doset=TRUE&progress="+progress+"&rem_trials="+JSON.stringify(trials)+"&score="+score,
        error: function(data) {
            alert("Your data has not been set!");
        }
    });
};

function getExperimentProgress() {
    var dat;
    $.ajax({
        type: "POST",
        async: false,
        url: "phpcmd/set_progress.php",
        data: "doset=FALSE",
        error: function(data) {
            alert("Your data cannot be retrieved!");
        },
        success: function(data) {
            dat = data;
        }
    });
    return JSON.parse(dat);
};

// Helper to record questionnaire Responses
function setQuestionnaireResponses(uid, flag, responses, callback) {
  $.ajax({
    type: "POST",
    async: false,
    url: "phpcmd/record_questionnaire.php",
    data: "uid="+uid+"&flag="+flag+"&responses="+responses,
    error: function(data) {
      alert("Cannot store questionnaire responses; please check your internet connection and try again. If this does not work, please contact k2smith@mit.edu")
    },
    success: function(data) {
      callback()
    }
  })
}
