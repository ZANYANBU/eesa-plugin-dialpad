// AUTO-GENERATED from spec/dialpad-openapi.json by scripts/generate-tools.mjs.
// Do NOT edit by hand — re-run the generator instead. Every entry is one GET
// (read-only) Dialpad operation. Generated: 102 tools.

export const GENERATED_TOOLS = [
  {
    "name": "accesscontrolpolicies_assignments",
    "description": "Access Control Policies -- List Assignments [read-only]",
    "tag": "accesscontrolpolicies",
    "path": "/accesscontrolpolicies/{id}/assignments",
    "pathParams": [
      "id"
    ],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "id": {
          "type": "integer",
          "description": "The access control policy's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "accesscontrolpolicies_get",
    "description": "Access Control Policies -- Get [read-only]",
    "tag": "accesscontrolpolicies",
    "path": "/accesscontrolpolicies/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The access control policy's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "accesscontrolpolicies_list",
    "description": "Access Control Policies -- List Policies [read-only]",
    "tag": "accesscontrolpolicies",
    "path": "/accesscontrolpolicies",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "agentgroup_get",
    "description": "Agent Group -- Get [read-only]",
    "tag": "agent-groups",
    "path": "/agent-groups/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "the Agent Group id"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "app_settings_get",
    "description": "App Settings -- Get [read-only]",
    "tag": "app",
    "path": "/app/settings",
    "pathParams": [],
    "queryParams": [
      "target_id",
      "target_type"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        },
        "target_type": {
          "type": "string",
          "description": "The target's type."
        }
      }
    }
  },
  {
    "name": "blockednumbers_get",
    "description": "Blocked Number -- Get [read-only]",
    "tag": "blockednumbers",
    "path": "/blockednumbers/{number}",
    "pathParams": [
      "number"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "number": {
          "type": "string",
          "description": "A phone number (e164 format)."
        }
      },
      "required": [
        "number"
      ]
    }
  },
  {
    "name": "blockednumbers_list",
    "description": "Blocked Numbers -- List [read-only]",
    "tag": "blockednumbers",
    "path": "/blockednumbers",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "call_list_callbacks",
    "description": "Call Back -- List [read-only]",
    "tag": "callback",
    "path": "/callback",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "limit",
      "call_center_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of results."
        },
        "limit": {
          "type": "integer",
          "description": "Maximum results per page (default: 20, max: 100)."
        },
        "call_center_id": {
          "type": "integer",
          "description": "The call center ID to query."
        }
      },
      "required": [
        "call_center_id"
      ]
    }
  },
  {
    "name": "call_get_ai_recap",
    "description": "Call -- Get Ai Recap [read-only]",
    "tag": "call",
    "path": "/call/{id}/ai_recap",
    "pathParams": [
      "id"
    ],
    "queryParams": [
      "summary_format"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The call's id."
        },
        "summary_format": {
          "type": "string",
          "description": "The format of the summary to retrieve e.g."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "call_get_assigned_operators",
    "description": "Call -- Assigned Operators [read-only]",
    "tag": "call",
    "path": "/call/{id}/assigned",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The call's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "call_get_call_info",
    "description": "Call -- Get [read-only]",
    "tag": "call",
    "path": "/call/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The call's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "call_list",
    "description": "Call -- List [read-only]",
    "tag": "call",
    "path": "/call",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "include_anonymized",
      "started_after",
      "started_before",
      "target_id",
      "target_type"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "include_anonymized": {
          "type": "boolean",
          "description": "If set to true, includes call records that have been anonymized (e.g., calls associated with deleted users)."
        },
        "started_after": {
          "type": "integer",
          "description": "Only includes calls that started more recently than the specified timestamp."
        },
        "started_before": {
          "type": "integer",
          "description": "Only includes calls that started prior to the specified timestamp."
        },
        "target_id": {
          "type": "integer",
          "description": "The ID of a target to filter against."
        },
        "target_type": {
          "type": "string",
          "description": "The target type associated with the target ID."
        }
      }
    }
  },
  {
    "name": "callcenters_get",
    "description": "Call Centers -- Get [read-only]",
    "tag": "callcenters",
    "path": "/callcenters/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The call center's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "callcenters_get_status",
    "description": "Call Centers -- Status [read-only]",
    "tag": "callcenters",
    "path": "/callcenters/{id}/status",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The call center's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "callcenters_listall",
    "description": "Call Centers -- List [read-only]",
    "tag": "callcenters",
    "path": "/callcenters",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "office_id",
      "name_search"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "search call center by office."
        },
        "name_search": {
          "type": "string",
          "description": "search call centers by name or search by the substring of the name."
        }
      }
    }
  },
  {
    "name": "callcenters_operators_get_duty_status",
    "description": "Operator -- Get Duty Status [read-only]",
    "tag": "callcenters",
    "path": "/callcenters/operators/{id}/dutystatus",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The operator's user id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "callcenters_operators_get_skill_level",
    "description": "Operator -- Get Skill Level [read-only]",
    "tag": "callcenters",
    "path": "/callcenters/{call_center_id}/operators/{user_id}/skill",
    "pathParams": [
      "call_center_id",
      "user_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "call_center_id": {
          "type": "integer",
          "description": "The call center's ID"
        },
        "user_id": {
          "type": "integer",
          "description": "The operator's ID"
        }
      },
      "required": [
        "call_center_id",
        "user_id"
      ]
    }
  },
  {
    "name": "callcenters_operators_list",
    "description": "Operators -- List [read-only]",
    "tag": "callcenters",
    "path": "/callcenters/{id}/operators",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The call center's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "calllabel_list",
    "description": "Label -- List [read-only]",
    "tag": "calllabels",
    "path": "/calllabels",
    "pathParams": [],
    "queryParams": [
      "limit"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "description": "The maximum number of results to return."
        }
      }
    }
  },
  {
    "name": "call_review_share_link_get",
    "description": "Call Review Sharelink -- Get [read-only]",
    "tag": "callreviewsharelink",
    "path": "/callreviewsharelink/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The share link's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "callrouters_get",
    "description": "Call Router -- Get [read-only]",
    "tag": "callrouters",
    "path": "/callrouters/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The API call router's ID"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "callrouters_list",
    "description": "Call Router -- List [read-only]",
    "tag": "callrouters",
    "path": "/callrouters",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "office_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      }
    }
  },
  {
    "name": "channels_get",
    "description": "Channel -- Get [read-only]",
    "tag": "channels",
    "path": "/channels/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The channel id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "channels_list",
    "description": "Channel -- List [read-only]",
    "tag": "channels",
    "path": "/channels",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "state"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "state": {
          "type": "string",
          "description": "The state of the channel."
        }
      }
    }
  },
  {
    "name": "channels_members_list",
    "description": "Members -- List [read-only]",
    "tag": "channels",
    "path": "/channels/{id}/members",
    "pathParams": [
      "id"
    ],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "id": {
          "type": "integer",
          "description": "The channel id"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "coaching_team_get",
    "description": "Coaching Team -- Get [read-only]",
    "tag": "coachingteams",
    "path": "/coachingteams/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "Id of the coaching team"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "coaching_team_listall",
    "description": "Coaching Team -- List [read-only]",
    "tag": "coachingteams",
    "path": "/coachingteams",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "coaching_team_members_get",
    "description": "Coaching Team -- List Members [read-only]",
    "tag": "coachingteams",
    "path": "/coachingteams/{id}/members",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "Id of the coaching team"
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "company_get",
    "description": "Company -- Get [read-only]",
    "tag": "company",
    "path": "/company",
    "pathParams": [],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "company_sms_opt_out",
    "description": "Company -- Get SMS Opt-out List [read-only]",
    "tag": "company",
    "path": "/company/{id}/smsoptout",
    "pathParams": [
      "id"
    ],
    "queryParams": [
      "a2p_campaign_id",
      "cursor",
      "opt_out_state"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "ID of the requested company."
        },
        "a2p_campaign_id": {
          "type": "integer",
          "description": "Optional company A2P campaign entity id to filter results by."
        },
        "cursor": {
          "type": "string",
          "description": "Optional token used to return the next page of a previous request."
        },
        "opt_out_state": {
          "type": "string",
          "description": "Required opt-out state to filter results by."
        }
      },
      "required": [
        "id",
        "opt_out_state"
      ]
    }
  },
  {
    "name": "conference_meetings_list",
    "description": "Meeting Summary -- List [read-only]",
    "tag": "conference",
    "path": "/conference/meetings",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "room_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "room_id": {
          "type": "string",
          "description": "The meeting room's ID."
        }
      }
    }
  },
  {
    "name": "conference_rooms_list",
    "description": "Meeting Room -- List [read-only]",
    "tag": "conference",
    "path": "/conference/rooms",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "contacts_get",
    "description": "Contact -- Get [read-only]",
    "tag": "contacts",
    "path": "/contacts/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The contact's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "contacts_list",
    "description": "Contact -- List [read-only]",
    "tag": "contacts",
    "path": "/contacts",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "include_local",
      "owner_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "include_local": {
          "type": "boolean",
          "description": "If set to True company local contacts will be included."
        },
        "owner_id": {
          "type": "string",
          "description": "The id of the user who owns the contact."
        }
      }
    }
  },
  {
    "name": "custom_ivrs_get",
    "description": "Custom IVR -- Get [read-only]",
    "tag": "customivrs",
    "path": "/customivrs",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "target_type",
      "target_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "target_type": {
          "type": "string",
          "description": "Target's type."
        },
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        }
      },
      "required": [
        "target_type",
        "target_id"
      ]
    }
  },
  {
    "name": "departments_get",
    "description": "Department -- Get [read-only]",
    "tag": "departments",
    "path": "/departments/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The department's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "departments_listall",
    "description": "Department -- List [read-only]",
    "tag": "departments",
    "path": "/departments",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "office_id",
      "name_search"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "filter departments by office."
        },
        "name_search": {
          "type": "string",
          "description": "search departments by name or search by the substring of the name."
        }
      }
    }
  },
  {
    "name": "departments_operators_get",
    "description": "Operator -- List [read-only]",
    "tag": "departments",
    "path": "/departments/{id}/operators",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The department's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "digital_sessionsdata_list",
    "description": "Digital -- Sessions -- List [read-only]",
    "tag": "digital",
    "path": "/digital/sessionsdata",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "end_date",
      "target_id",
      "target_type",
      "start_date"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "end_date": {
          "type": "string",
          "description": "End date of the date range to be queried."
        },
        "target_id": {
          "type": "integer",
          "description": "Optional."
        },
        "target_type": {
          "type": "string",
          "description": "Optional."
        },
        "start_date": {
          "type": "string",
          "description": "Start date of the date range to be queried E.g."
        }
      },
      "required": [
        "end_date",
        "start_date"
      ]
    }
  },
  {
    "name": "dispositions_get",
    "description": "Dispositions -- Get [read-only]",
    "tag": "dispositions",
    "path": "/dispositions/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The disposition's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "dispositions_list",
    "description": "Dispositions -- List [read-only]",
    "tag": "dispositions",
    "path": "/dispositions",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "target_id",
      "target_type"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        },
        "target_type": {
          "type": "string",
          "description": "The target's type."
        }
      }
    }
  },
  {
    "name": "meetings_get",
    "description": "Dialpad Meeting -- Get [read-only]",
    "tag": "meetings",
    "path": "/meetings/{scheduled_conference_id}",
    "pathParams": [
      "scheduled_conference_id"
    ],
    "queryParams": [
      "user_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "user_id": {
          "type": "integer",
          "description": "The Dialpad user's id."
        },
        "scheduled_conference_id": {
          "type": "integer",
          "description": "The meeting room's ID."
        }
      },
      "required": [
        "scheduled_conference_id"
      ]
    }
  },
  {
    "name": "meetings_list",
    "description": "Dialpad Meeting -- List [read-only]",
    "tag": "meetings",
    "path": "/meetings",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "user_id",
      "end_datetime",
      "start_datetime"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "user_id": {
          "type": "integer",
          "description": "The Dialpad user's id."
        },
        "end_datetime": {
          "type": "integer",
          "description": "The meeting's end time (UTC seconds-since-epoch timestamp)."
        },
        "start_datetime": {
          "type": "integer",
          "description": "The meeting's start time (UTC seconds-since-epoch timestamp)."
        }
      },
      "required": [
        "user_id",
        "start_datetime"
      ]
    }
  },
  {
    "name": "bulk_messages_get",
    "description": "Bulk Message -- Get [read-only]",
    "tag": "message",
    "path": "/message/bulk/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The bulk message's ID (key string)."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "bulk_messages_list",
    "description": "Bulk Message -- List [read-only]",
    "tag": "message",
    "path": "/message/bulk",
    "pathParams": [],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "schedules_get",
    "description": "Schedule -- Get [read-only]",
    "tag": "message",
    "path": "/message/schedule/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The schedule's ID (key string)."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "schedules_list",
    "description": "Schedule -- List [read-only]",
    "tag": "message",
    "path": "/message/schedule",
    "pathParams": [],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "numbers_get",
    "description": "Dialpad Number -- Get [read-only]",
    "tag": "numbers",
    "path": "/numbers/{number}",
    "pathParams": [
      "number"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "number": {
          "type": "string",
          "description": "A phone number (e164 format)."
        }
      },
      "required": [
        "number"
      ]
    }
  },
  {
    "name": "numbers_list",
    "description": "Dialpad Number -- List [read-only]",
    "tag": "numbers",
    "path": "/numbers",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "status"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "status": {
          "type": "string",
          "description": "Status to filter by."
        }
      }
    }
  },
  {
    "name": "callcenters_list",
    "description": "Call Centers -- List [read-only]",
    "tag": "offices",
    "path": "/offices/{office_id}/callcenters",
    "pathParams": [
      "office_id"
    ],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "office_id"
      ]
    }
  },
  {
    "name": "coaching_team_list",
    "description": "Coaching Team -- List [read-only]",
    "tag": "offices",
    "path": "/offices/{office_id}/teams",
    "pathParams": [
      "office_id"
    ],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "office_id"
      ]
    }
  },
  {
    "name": "departments_list",
    "description": "Department -- List [read-only]",
    "tag": "offices",
    "path": "/offices/{office_id}/departments",
    "pathParams": [
      "office_id"
    ],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "office_id"
      ]
    }
  },
  {
    "name": "offices_e911_get",
    "description": "E911 Address -- Get [read-only]",
    "tag": "offices",
    "path": "/offices/{id}/e911",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "offices_get",
    "description": "Office -- Get [read-only]",
    "tag": "offices",
    "path": "/offices/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "offices_list",
    "description": "Office -- List [read-only]",
    "tag": "offices",
    "path": "/offices",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "active_only"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "active_only": {
          "type": "boolean",
          "description": "Whether we only return active offices."
        }
      }
    }
  },
  {
    "name": "offices_offdutystatuses_get",
    "description": "Off-Duty Status -- List [read-only]",
    "tag": "offices",
    "path": "/offices/{id}/offdutystatuses",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "offices_operators_get",
    "description": "Operator -- List [read-only]",
    "tag": "offices",
    "path": "/offices/{id}/operators",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "offices_primary_get",
    "description": "Office -- Get Primary [read-only]",
    "tag": "offices",
    "path": "/offices/primary",
    "pathParams": [],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "plan_available_licenses_get",
    "description": "Licenses -- List Available [read-only]",
    "tag": "offices",
    "path": "/offices/{office_id}/available_licenses",
    "pathParams": [
      "office_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "office_id"
      ]
    }
  },
  {
    "name": "plan_get",
    "description": "Billing Plan -- Get [read-only]",
    "tag": "offices",
    "path": "/offices/{office_id}/plan",
    "pathParams": [
      "office_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      },
      "required": [
        "office_id"
      ]
    }
  },
  {
    "name": "recording_share_link_get",
    "description": "Recording Sharelink -- Get [read-only]",
    "tag": "recordingsharelink",
    "path": "/recordingsharelink/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The recording share link's ID."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "deskphones_rooms_get",
    "description": "Room Phone -- Get [read-only]",
    "tag": "rooms",
    "path": "/rooms/{parent_id}/deskphones/{id}",
    "pathParams": [
      "id",
      "parent_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The desk phone's id."
        },
        "parent_id": {
          "type": "integer",
          "description": "The room's id."
        }
      },
      "required": [
        "id",
        "parent_id"
      ]
    }
  },
  {
    "name": "deskphones_rooms_list",
    "description": "Room Phone -- List [read-only]",
    "tag": "rooms",
    "path": "/rooms/{parent_id}/deskphones",
    "pathParams": [
      "parent_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "parent_id": {
          "type": "integer",
          "description": "The room's id."
        }
      },
      "required": [
        "parent_id"
      ]
    }
  },
  {
    "name": "rooms_get",
    "description": "Room -- Get [read-only]",
    "tag": "rooms",
    "path": "/rooms/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The room's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "rooms_list",
    "description": "Room -- List [read-only]",
    "tag": "rooms",
    "path": "/rooms",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "office_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "office_id": {
          "type": "integer",
          "description": "The office's id."
        }
      }
    }
  },
  {
    "name": "schedule_reports_get",
    "description": "Schedule reports -- Get [read-only]",
    "tag": "schedulereports",
    "path": "/schedulereports/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The schedule reports subscription's ID."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "schedule_reports_list",
    "description": "Schedule reports -- List [read-only]",
    "tag": "schedulereports",
    "path": "/schedulereports",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "scorecards_export_get",
    "description": "Scorecards export -- Get Result [read-only]",
    "tag": "scorecards",
    "path": "/scorecards/export/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Request ID returned by a POST /scorecards/export request."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "scorecards_get",
    "description": "Scorecards -- Get [read-only]",
    "tag": "scorecards",
    "path": "/scorecards/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The scorecard's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "scorecards_list",
    "description": "Scorecards -- List [read-only]",
    "tag": "scorecards",
    "path": "/scorecards",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "state",
      "target_id",
      "target_type"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "state": {
          "type": "string",
          "description": "The scorecard's state."
        },
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        },
        "target_type": {
          "type": "string",
          "description": "The target's type."
        }
      }
    }
  },
  {
    "name": "stats_get",
    "description": "Stats -- Get Result [read-only]",
    "tag": "stats",
    "path": "/stats/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Request ID returned by a POST /stats request."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_agent_status_event_subscription_get",
    "description": "Agent Status -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/agent_status/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_agent_status_event_subscription_list",
    "description": "Agent Status -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/agent_status",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "webhook_call_event_subscription_get",
    "description": "Call Event -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/call/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_call_event_subscription_list",
    "description": "Call Event -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/call",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "target_type",
      "target_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "target_type": {
          "type": "string",
          "description": "Target's type."
        },
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        }
      }
    }
  },
  {
    "name": "webhook_change_log_event_subscription_get",
    "description": "Change Log -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/changelog/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_change_log_event_subscription_list",
    "description": "Change Log -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/changelog",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "webhook_channel_event_subscription_get",
    "description": "Channel Event -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/channel/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_channel_event_subscription_list",
    "description": "Channel Event -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/channel",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "webhook_contact_event_subscription_get",
    "description": "Contact Event -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/contact/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_contact_event_subscription_list",
    "description": "Contact Event -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/contact",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "webhook_fax_event_subscription_get",
    "description": "Fax Event -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/fax/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_fax_event_subscription_list",
    "description": "Fax Event -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/fax",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "target_id",
      "target_type"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        },
        "target_type": {
          "type": "string",
          "description": "The target's type."
        }
      }
    }
  },
  {
    "name": "webhook_sms_event_subscription_get",
    "description": "SMS Event -- Get [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/sms/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The event subscription's ID, which is generated after creating an event subscription successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhook_sms_event_subscription_list",
    "description": "SMS Event -- List [read-only]",
    "tag": "subscriptions",
    "path": "/subscriptions/sms",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "target_type",
      "target_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "target_type": {
          "type": "string",
          "description": "Target's type."
        },
        "target_id": {
          "type": "integer",
          "description": "The target's id."
        }
      }
    }
  },
  {
    "name": "transcripts_get",
    "description": "Call Transcript -- Get [read-only]",
    "tag": "transcripts",
    "path": "/transcripts/{call_id}",
    "pathParams": [
      "call_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "call_id": {
          "type": "integer",
          "description": "The call's id."
        }
      },
      "required": [
        "call_id"
      ]
    }
  },
  {
    "name": "transcripts_get_url",
    "description": "Call Transcript -- Get URL [read-only]",
    "tag": "transcripts",
    "path": "/transcripts/{call_id}/url",
    "pathParams": [
      "call_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "call_id": {
          "type": "integer",
          "description": "The call's id."
        }
      },
      "required": [
        "call_id"
      ]
    }
  },
  {
    "name": "userdevices_get",
    "description": "User Device -- Get [read-only]",
    "tag": "userdevices",
    "path": "/userdevices/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The device's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "userdevices_list",
    "description": "User Device -- List [read-only]",
    "tag": "userdevices",
    "path": "/userdevices",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "user_id"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "user_id": {
          "type": "string",
          "description": "The user's id."
        }
      }
    }
  },
  {
    "name": "caller_id_users_get",
    "description": "Caller ID -- Get [read-only]",
    "tag": "users",
    "path": "/users/{id}/caller_id",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The user's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "deskphones_users_get",
    "description": "Desk Phone -- Get [read-only]",
    "tag": "users",
    "path": "/users/{parent_id}/deskphones/{id}",
    "pathParams": [
      "id",
      "parent_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The desk phone's id."
        },
        "parent_id": {
          "type": "integer",
          "description": "The user's id."
        }
      },
      "required": [
        "id",
        "parent_id"
      ]
    }
  },
  {
    "name": "deskphones_users_list",
    "description": "Desk Phone -- List [read-only]",
    "tag": "users",
    "path": "/users/{parent_id}/deskphones",
    "pathParams": [
      "parent_id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "parent_id": {
          "type": "integer",
          "description": "The user's id."
        }
      },
      "required": [
        "parent_id"
      ]
    }
  },
  {
    "name": "users_e911_get",
    "description": "E911 Address -- Get [read-only]",
    "tag": "users",
    "path": "/users/{id}/e911",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The user's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "users_get",
    "description": "User -- Get [read-only]",
    "tag": "users",
    "path": "/users/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The user's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "users_list",
    "description": "User -- List [read-only]",
    "tag": "users",
    "path": "/users",
    "pathParams": [],
    "queryParams": [
      "cursor",
      "first_name",
      "last_name",
      "state",
      "company_admin",
      "email",
      "number"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        },
        "first_name": {
          "type": "string",
          "description": "Filter results by first name prefix (e.g."
        },
        "last_name": {
          "type": "string",
          "description": "Filter results by last name prefix (e.g."
        },
        "state": {
          "type": "string",
          "description": "Filter results by the specified user state (e.g."
        },
        "company_admin": {
          "type": "boolean",
          "description": "If provided, filter results by the specified value to return only company admins or only non-company admins."
        },
        "email": {
          "type": "string",
          "description": "The user's email."
        },
        "number": {
          "type": "string",
          "description": "The user's phone number."
        }
      }
    }
  },
  {
    "name": "users_list_personas",
    "description": "Persona -- List [read-only]",
    "tag": "users",
    "path": "/users/{id}/personas",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "The user's id."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhooks_get",
    "description": "Webhook -- Get [read-only]",
    "tag": "webhooks",
    "path": "/webhooks/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The webhook's ID, which is generated after creating a webhook successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "webhooks_list",
    "description": "Webhook -- List [read-only]",
    "tag": "webhooks",
    "path": "/webhooks",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "websockets_get",
    "description": "Websocket -- Get [read-only]",
    "tag": "websockets",
    "path": "/websockets/{id}",
    "pathParams": [
      "id"
    ],
    "queryParams": [],
    "inputSchema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "The websocket's ID, which is generated after creating a websocket successfully."
        }
      },
      "required": [
        "id"
      ]
    }
  },
  {
    "name": "websockets_list",
    "description": "Websocket -- List [read-only]",
    "tag": "websockets",
    "path": "/websockets",
    "pathParams": [],
    "queryParams": [
      "cursor"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "cursor": {
          "type": "string",
          "description": "A token used to return the next page of a previous request."
        }
      }
    }
  },
  {
    "name": "wfm_metrics_activity_get",
    "description": "Activity Metrics [read-only]",
    "tag": "wfm",
    "path": "/wfm/metrics/activity",
    "pathParams": [],
    "queryParams": [
      "ids",
      "emails",
      "cursor",
      "end",
      "start"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "ids": {
          "type": "string",
          "description": "(optional) Comma-separated Dialpad user IDs of agents"
        },
        "emails": {
          "type": "string",
          "description": "(optional) Comma-separated email addresses of agents"
        },
        "cursor": {
          "type": "string",
          "description": "Include the cursor returned in a previous request to get the next page of data"
        },
        "end": {
          "type": "string",
          "description": "UTC ISO 8601 timestamp (exclusive, e.g., 2025-02-23T00:00:00Z)"
        },
        "start": {
          "type": "string",
          "description": "UTC ISO 8601 timestamp (inclusive, e.g., 2025-02-17T00:00:00Z)"
        }
      },
      "required": [
        "end",
        "start"
      ]
    }
  },
  {
    "name": "wfm_metrics_agent_get",
    "description": "Agent Metrics [read-only]",
    "tag": "wfm",
    "path": "/wfm/metrics/agent",
    "pathParams": [],
    "queryParams": [
      "ids",
      "emails",
      "cursor",
      "end",
      "start"
    ],
    "inputSchema": {
      "type": "object",
      "properties": {
        "ids": {
          "type": "string",
          "description": "(optional) Comma-separated Dialpad user IDs of agents"
        },
        "emails": {
          "type": "string",
          "description": "(optional) Comma-separated email addresses of agents"
        },
        "cursor": {
          "type": "string",
          "description": "Include the cursor returned in a previous request to get the next page of data"
        },
        "end": {
          "type": "string",
          "description": "UTC ISO 8601 timestamp (exclusive, e.g., 2025-02-23T00:00:00Z)"
        },
        "start": {
          "type": "string",
          "description": "UTC ISO 8601 timestamp (inclusive, e.g., 2025-02-17T00:00:00Z)"
        }
      },
      "required": [
        "end",
        "start"
      ]
    }
  }
];
