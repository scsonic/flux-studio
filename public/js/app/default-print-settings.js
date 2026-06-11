"use strict";

define(function () {
    return {
        defaultSetting: true,
        cura2: "acceleration_enabled = false\nacceleration_infill = 3000\nacceleration_prime_tower = 3000\nacceleration_print_layer_0 = 3000\nacceleration_skirt_brim = 3000\nacceleration_support_infill = 3000\nacceleration_support_interface = 3000\nacceleration_topbottom = 3000\nacceleration_travel = 5000\nacceleration_travel_layer_0 = 5000\nacceleration_wall_0 = 3000\nacceleration_wall_x = 3000\nadhesion_extruder_nr = 0\nadhesion_type = brim\nalternate_carve_order = true\nalternate_extra_perimeter = true\nanti_overhang_mesh = false\nbottom_layers = 5\nbrim_line_count = 0\nbrim_outside_only = true\ncarve_multiple_volumes = false\ncoasting_enable = false\ncoasting_min_volume = 0.8\ncoasting_speed = 90\ncoasting_volume = 0.064\nconical_overhang_angle = 50\nconical_overhang_enabled = false\ncool_fan_enabled = true\ncool_fan_full_layer = 2\ncool_fan_speed_0 = 0\ncool_fan_speed_max = 100\ncool_fan_speed_min = 100\ncool_lift_head = false\ncool_min_layer_time = 5\ncool_min_layer_time_fan_speed_max = 10\ncool_min_speed = 10\ndefault_material_print_temperature = 205\ndraft_shield_dist = 10\ndraft_shield_enabled = false\ndraft_shield_height = 10\ndraft_shield_height_limitation = full\ndual_pre_wipe = true\nextruder_prime_pos_abs = false\nextruder_prime_pos_x = 0\nextruder_prime_pos_y = 0\nextruder_prime_pos_z = 0\nfill_perimeter_gaps = everywhere\ngradual_infill_step_height = 5\ngradual_infill_steps = 0\ninfill_before_walls = false\ninfill_hollow = false\ninfill_line_distance = 4\ninfill_line_width = 0.4\ninfill_mesh = false\ninfill_mesh_order = 0\ninfill_overlap_mm = 0.04\ninfill_pattern = triangles\ninfill_sparse_thickness = 0.15\ninfill_wipe_dist = 0.04\njerk_enabled = false\njerk_infill = 20\njerk_prime_tower = 20\njerk_print_layer_0 = 20\njerk_skirt_brim = 20\njerk_support_infill = 20\njerk_support_interface = 20\njerk_topbottom = 20\njerk_travel = 30\njerk_travel_layer_0 = 30\njerk_wall_0 = 20\njerk_wall_x = 20\nlayer_0_z_overlap = 0.15\nlayer_height = 0.15\nlayer_height_0 = 0.3\nlayer_start_x = 0\nlayer_start_y = 0\nmachine_disallowed_areas =\nmachine_end_gcode = G91\\nG1 E-40 F2400\\nM104 S0\\nG90\\nM84\\n\nmachine_min_cool_heat_time_window = 50\nmachine_start_gcode = G1 F6000 Z50\\nG92 Z49.9 \\nG1 F2400 E32 \\nG92 E0\nmagic_fuzzy_skin_enabled = false\nmagic_fuzzy_skin_point_dist = 0.8\nmagic_fuzzy_skin_thickness = 0.3\nmagic_mesh_surface_mode = normal\nmagic_spiralize = false\nmaterial_bed_temp_prepend = true\nmaterial_bed_temp_wait = true\nmaterial_bed_temperature = 60\nmaterial_bed_temperature_layer_0 = 60\nmaterial_diameter = 1.75\nmaterial_extrusion_cool_down_speed = 0.7\nmaterial_final_print_temperature = 195\nmaterial_flow = 100\nmaterial_flow_dependent_temperature = false\nmaterial_flow_temp_graph = [[3.5,200],[7.0,240]]\nmaterial_initial_print_temperature = 200\nmaterial_print_temp_prepend = true\nmaterial_print_temp_wait = true\nmaterial_print_temperature = 200\nmaterial_print_temperature_layer_0 = 230\nmaterial_standby_temperature = 150\nmax_feedrate_z_override = 0\nmeshfix_extensive_stitching = false\nmeshfix_keep_open_polygons = false\nmeshfix_union_all = true\nmeshfix_union_all_remove_holes = false\nmin_infill_area = 0\nmultiple_mesh_overlap = 0.15\nnozzle_disallowed_areas =\nooze_shield_angle = 60\nooze_shield_dist = 2\nooze_shield_enabled = false\nouter_inset_first = false\nprime_tower_enable = false\nprime_tower_flow = 100\nprime_tower_line_width = 0.4\nprime_tower_position_x = 200\nprime_tower_position_y = 200\nprime_tower_size = 15\nprime_tower_wall_thickness = 2\nprime_tower_wipe_enabled = true\nprint_sequence = all_at_once\nraft = 0\nraft_airgap = 0.3\nraft_base_acceleration = 3000\nraft_base_fan_speed = 0\nraft_base_jerk = 20\nraft_base_line_spacing = 1.6\nraft_base_line_width = 1\nraft_base_speed = 15\nraft_base_thickness = 0.36\nraft_interface_acceleration = 3000\nraft_interface_fan_speed = 0\nraft_interface_jerk = 20\nraft_interface_line_spacing = 0.9\nraft_interface_line_width = 0.8\nraft_interface_speed = 15\nraft_interface_thickness = 0.225\nraft_margin = 5\nraft_surface_acceleration = 3000\nraft_surface_fan_speed = 0\nraft_surface_jerk = 20\nraft_surface_layers = 4\nraft_surface_line_spacing = 0.4\nraft_surface_line_width = 0.4\nraft_surface_speed = 20\nraft_surface_thickness = 0.1\nretract_at_layer_change = false\nretraction_amount = 8\nretraction_combing = off\nretraction_count_max = 50\nretraction_enable = true\nretraction_extra_prime_amount = 0\nretraction_extrusion_window = 8\nretraction_hop = 0.05\nretraction_hop_after_extruder_switch = true\nretraction_hop_enabled = true\nretraction_hop_only_when_collides = true\nretraction_min_travel = 0.8\nretraction_prime_speed = 80\nretraction_retract_speed = 50\nskin_alternate_rotation = false\nskin_line_width = 0.4\nskin_no_small_gaps_heuristic = true\nskin_outline_count = 0\nskin_overlap_mm = 0.02\nskirt_brim_line_width = 0.4\nskirt_brim_minimal_length = 10\nskirt_brim_speed = 10\nskirt_gap = 3\nskirt_line_count = 2\nspeed_equalize_flow_enabled = false\nspeed_equalize_flow_max = 150\nspeed_infill = 80\nspeed_prime_tower = 60\nspeed_print_layer_0 = 10\nspeed_slowdown_layers = 2\nspeed_support_infill = 80\nspeed_support_interface = 40\nspeed_topbottom = 30\nspeed_travel = 150\nspeed_travel_layer_0 = 56.25\nspeed_wall_0 = 15\nspeed_wall_x = 40\nstart_layers_at_same_position = true\nsub_div_rad_add = 0.4\nsub_div_rad_mult = 100\nsupport_angle = 53\nsupport_bottom_distance = 0.15\nsupport_bottom_height = 1\nsupport_bottom_stair_step_height = 0.3\nsupport_conical_angle = 30\nsupport_conical_enabled = false\nsupport_conical_min_width = 5\nsupport_connect_zigzags = true\nsupport_enable = 0\nsupport_extruder_nr_layer_0 = 0\nsupport_infill_extruder_nr = 0\nsupport_interface_enable = false\nsupport_interface_extruder_nr = 0\nsupport_interface_line_distance = 0.4\nsupport_interface_line_width = 0.4\nsupport_interface_pattern = concentric\nsupport_interface_skip_height = 0.3\nsupport_join_distance = 2\nsupport_line_distance = 2.0\nsupport_line_width = 0.35\nsupport_mesh = false\nsupport_minimal_diameter = 3\nsupport_offset = 0.2\nsupport_pattern = zigzag\nsupport_roof_height = 1\nsupport_top_distance = 0.15\nsupport_tower_diameter = 3\nsupport_tower_roof_angle = 65\nsupport_type = everywhere\nsupport_use_towers = true\nsupport_xy_distance = 0.7\nsupport_xy_distance_overhang = 0.2\nsupport_xy_overrides_z = z_overrides_xy\nswitch_extruder_prime_speed = 20\nswitch_extruder_retraction_amount = 20\nswitch_extruder_retraction_speed = 20\ntop_bottom_pattern = lines\ntop_bottom_pattern_0 = lines\ntop_layers = 5\ntravel_avoid_distance = 2\ntravel_avoid_other_parts = true\ntravel_compensate_overlapping_walls_0_enabled = true\ntravel_compensate_overlapping_walls_x_enabled = true\nwall_0_inset = 0\nwall_0_wipe_dist = 0.2\nwall_line_count = 3\nwall_line_width_0 = 0.4\nwall_line_width_x = 0.4\nwireframe_bottom_delay = 0\nwireframe_drag_along = 0.6\nwireframe_enabled = false\nwireframe_fall_down = 0.5\nwireframe_flat_delay = 0.1\nwireframe_flow_connection = 100\nwireframe_flow_flat = 100\nwireframe_height = 3\nwireframe_nozzle_clearance = 1\nwireframe_printspeed_bottom = 5\nwireframe_printspeed_down = 5\nwireframe_printspeed_flat = 5\nwireframe_printspeed_up = 5\nwireframe_roof_drag_along = 0.8\nwireframe_roof_fall_down = 2\nwireframe_roof_inset = 3\nwireframe_roof_outer_delay = 0.2\nwireframe_straight_before_down = 20\nwireframe_strategy = compensate\nwireframe_top_delay = 0\nwireframe_top_jump = 0.6\nwireframe_up_half_speed = 0.3\nxy_offset = -0.03\nz_seam_type = shortest\nz_seam_x = 85\nz_seam_y = 510\n# FLUX Machine Parameters\ncut_bottom = 0\ndetect_filament_runout = 1\ndetect_head_tilt = 1\ndetect_head_shake = 1\nflux_calibration = 1\ngeometric_error_correction_on = 1\npause_at_layers =\ntemperature = 200\nz_offset = 0.1",
        fd1p: {
            high: {
                "layer_height": 0.075,
                "travel_speed": 120,
                "infill_speed": 80,
                "support_material_speed": 80,
                "retract_lift": 0.05,
                "temperature": 200,
                "perimeter_speed": 40,
                "external_perimeter_speed": 15,
                "top_solid_layers": 8,
                "bottom_solid_layers": 6,
                "first_layer_temperature": 230,
                "support_material_spacing": 2.0,
                "support_material_contact_distance": 0.15
            },
            med: {
                "layer_height": 0.15,
                "travel_speed": 150,
                "infill_speed": 80,
                "support_material_speed": 80,
                "retract_lift": 0.05,
                "temperature": 200,
                "perimeter_speed": 40,
                "external_perimeter_speed": 15,
                "top_solid_layers": 5,
                "bottom_solid_layers": 5,
                "first_layer_temperature": 230,
                "support_material_spacing": 2.0,
                "support_material_contact_distance": 0.15
            },
            low: {
                "layer_height": 0.3,
                "travel_speed": 150,
                "infill_speed": 65,
                "support_material_speed": 65,
                "retract_lift": 0.05,
                "temperature": 215,
                "perimeter_speed": 40,
                "external_perimeter_speed": 15,
                "top_solid_layers": 3,
                "bottom_solid_layers": 3,
                "first_layer_temperature": 230,
                "support_material_spacing": 2.0,
                "support_material_contact_distance": 0.15
            }
        },
        fd1: {
            high: {
                "layer_height": 0.075,
                "travel_speed": 80,
                "infill_speed": 60,
                "support_material_speed": 60,
                "retract_lift": 0.24,
                "temperature": 200,
                "perimeter_speed": 40,
                "external_perimeter_speed": 15,
                "top_solid_layers": 8,
                "bottom_solid_layers": 6,
                "first_layer_temperature": 230,
                "support_material_spacing": 2.0,
                "support_material_contact_distance": 0.3
            },
            med: {
                "layer_height": 0.15,
                "travel_speed": 100,
                "infill_speed": 60,
                "support_material_speed": 60,
                "retract_lift": 0.24,
                "temperature": 200,
                "perimeter_speed": 40,
                "external_perimeter_speed": 15,
                "top_solid_layers": 5,
                "bottom_solid_layers": 5,
                "first_layer_temperature": 230,
                "support_material_spacing": 2.0,
                "support_material_contact_distance": 0.3
            },
            low: {
                "layer_height": 0.3,
                "travel_speed": 120,
                "infill_speed": 50,
                "support_material_speed": 50,
                "retract_lift": 0.24,
                "temperature": 215,
                "perimeter_speed": 40,
                "external_perimeter_speed": 15,
                "top_solid_layers": 3,
                "bottom_solid_layers": 3,
                "first_layer_temperature": 230,
                "support_material_spacing": 2.0,
                "support_material_contact_distance": 0.3
            }
        }
    };
});