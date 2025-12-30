# SprueCrafter - Future Improvements & Add-ons

## Overview

This document outlines potential future enhancements and add-ons for SprueCrafter, including features from rival competitive slicer and sprue creation programs. These improvements would expand SprueCrafter's capabilities to match and exceed industry-leading tools.

---

## 🎯 Priority Features

### 1. Advanced Support Features
*Inspired by: Lychee Slicer, PrusaSlicer, Chitubox, Voxeldance Tango*

- **Tree/Organic Supports**: Branching support structures that minimize contact points and material usage
- **Paint-on Supports**: Interactive brush-like tool to manually paint support areas
- **Support Bridges**: Horizontal bridge supports for better stability
- **Custom Support Profiles**: Preset support configurations (Light/Medium/Heavy)
- **Support Tip Shapes**: Customizable contact point shapes (sphere, cone, flat)
- **V-Supports**: Innovative V-shaped support design for easier removal
- **No-Support Zones**: Define areas where supports should not be placed
- **Support Area Preview**: Visual preview of support contact areas before generation
- **Support Strength Analysis**: Calculate and display support structural integrity
- **Support Material Estimation**: Precise calculation of support material cost

### 2. Island Detection and Analysis
*Inspired by: Chitubox, Lychee Slicer, Voxeldance Tango*

- **Automatic Island Detection**: Identify floating layers that may cause print failures
- **Island Highlighting**: Visual representation of problematic islands in 3D view
- **Island Fix Suggestions**: Automated recommendations to resolve island issues
- **Layer-by-Layer Analysis**: Inspect each print layer for potential problems
- **Real-time Island Warnings**: Live detection during model manipulation

### 3. Advanced Hollowing Tools
*Inspired by: Meshmixer, Chitubox, Lychee Slicer*

- **Post-Support Hollowing**: Hollow models even after support generation
- **Lattice Infill**: BCC, FCC, honeycomb, and custom internal structures
- **Variable Wall Thickness**: Different wall thicknesses for different model regions
- **Automatic Drain Holes**: Smart placement of drainage holes for resin removal
- **Drain Hole Templates**: Pre-configured hole sizes and placements
- **Weight and Material Savings Calculator**: Real-time cost reduction estimates
- **Mesh Density Control**: Adjust internal mesh resolution for performance

### 4. Mesh Repair and Quality Tools
*Inspired by: Meshmixer, Voxeldance Tango, Lychee Slicer*

- **One-Click Mesh Repair**: Automatic fix for common mesh issues
- **Bad Edge Detection**: Identify and highlight problematic edges
- **Hole Filling**: Automatic closure of mesh gaps
- **Intersection Resolution**: Fix self-intersecting geometry
- **Non-Manifold Edge Repair**: Correct edge connectivity issues
- **Surface Bridging**: Fill gaps between mesh components
- **Auto-Remeshing**: Regenerate mesh with improved topology
- **Mesh Simplification**: Reduce polygon count while preserving detail
- **Watertight Verification**: Check and ensure printable mesh quality
- **Quality Analysis Report**: Comprehensive mesh health assessment

---

## 🎨 Advanced Modeling Features

### 5. Sculpting Tools
*Inspired by: Meshmixer, ZBrush, 3D-Coat, Blender*

- **Sculpting Brushes**: Drag, draw, flatten, smooth, inflate, pinch
- **Brush Property Control**: Adjustable size, strength, depth
- **Symmetry Mode**: Mirror sculpting across axes
- **Dynamic Subdivision**: Real-time mesh refinement while sculpting
- **Masking Tools**: Protect areas from sculpting operations
- **Layer-Based Sculpting**: Non-destructive sculpting with layers
- **Alpha Brushes**: Custom brush shapes for detail work
- **Surface Detailing**: Add fine details to model surfaces
- **Relief Sculpting**: Create relief patterns and textures

### 6. Advanced Boolean Operations
*Inspired by: Blender, ZBrush, 3D-Coat, Voxeldance Tango*

- **Union**: Combine multiple meshes into one
- **Subtract**: Remove one mesh from another
- **Intersect**: Keep only overlapping geometry
- **Live Boolean**: Real-time boolean operation preview
- **Boolean History**: Undo/redo boolean operations
- **Multi-Object Boolean**: Perform operations on multiple objects simultaneously

### 7. Model Kit Assembly Features
*Inspired by: Blender Model Kit Maker*

- **Automated Sprue Layout**: AI-driven optimal part arrangement on sprues
- **Interlocking Part Design**: Create snap-fit connections between parts
- **Part Numbering System**: Automatic part identification labels
- **Assembly Instructions Generator**: Create step-by-step build guides
- **Packaging Layout**: Arrange sprues for kit packaging visualization
- **Part Duplication with Arrays**: Create multiple identical parts efficiently
- **Sprue Template Library**: Pre-designed sprue layouts for different kit types
- **Gate Position Optimization**: AI-suggested optimal gate placement for minimal cleanup

---

## 🔬 Simulation and Analysis

### 8. Flow Simulation
*Inspired by: Moldex3D, SolidWorks Plastics, Fusion 360*

- **Fill Pattern Analysis**: Simulate resin flow through gates and runners
- **Flow Velocity Visualization**: Display flow speed through sprue system
- **Pressure Distribution**: Show pressure variations during filling
- **Air Trap Detection**: Identify potential air bubble locations
- **Weld Line Prediction**: Locate where flow fronts meet
- **Temperature Analysis**: Track melt temperature throughout fill
- **Cooling Simulation**: Optimize cooling time and uniformity
- **Warpage Prediction**: Estimate post-print deformation
- **Shrinkage Calculation**: Predict dimensional changes during curing

### 9. Print Success Analysis
*Inspired by: Lychee Slicer, Chitubox*

- **Printability Score**: Overall rating of print success likelihood
- **Overhang Analysis**: Identify areas requiring supports
- **Stress Concentration Detection**: Find high-stress areas prone to failure
- **Resin Usage Estimation**: Accurate material cost calculation
- **Print Time Prediction**: Estimated completion time
- **Layer Exposure Optimization**: Suggest optimal exposure settings
- **Failure Risk Assessment**: Highlight potential failure points

### 10. Structural Analysis
*Inspired by: Fusion 360, SolidWorks Simulation*

- **Stress Analysis**: Calculate stress distribution in parts
- **Thermal Analysis**: Simulate heat transfer and thermal stress
- **Modal Analysis**: Determine natural frequencies and vibration modes
- **Buckling Analysis**: Predict structural failure under compression
- **Fatigue Analysis**: Estimate part lifespan under repeated stress
- **Shape Optimization**: AI-driven design improvements for strength-to-weight ratio

---

## 🖨️ Enhanced Printing Features

### 11. Advanced Slicing
*Inspired by: PrusaSlicer, Voxeldance Tango, Lychee Slicer*

- **Variable Layer Height**: Adjust resolution by region for detail vs. speed
- **Adaptive Slicing**: Automatic layer height based on model geometry
- **Anti-Aliasing**: Smooth layer edges for better surface quality
- **Greyscale Mode**: Enhanced detail through pixel-level exposure control
- **Blur Options**: Reduce aliasing artifacts
- **Multi-Exposure Slicing**: Different exposure settings per layer or region
- **Dynamic Support Exposure**: Separate exposure settings for supports

### 12. Printer and Material Management
*Inspired by: Chitubox Pro, Lychee Slicer, Voxeldance Tango*

- **Resin Database**: Library of resin properties and settings
- **Material Cost Tracking**: Track resin costs per print
- **Printer Usage History**: Log of all prints and statistics
- **Multi-Material Support**: Handle different resins in same project
- **Resin Compatibility Checker**: Verify resin works with printer
- **Custom Resin Profiles**: Create and share custom material settings
- **Automatic Resin Suggestions**: Recommend optimal resin for specific models

### 13. Exposure and Calibration
*Inspired by: UVTools, Voxeldance Tango*

- **Exposure Test Generator**: Create calibration prints
- **Exposure Matrix**: Test multiple exposure settings simultaneously
- **Resin Validation Models**: Pre-designed calibration test pieces
- **LCD Brightness Calibration**: Optimize screen uniformity
- **Lift Speed Optimization**: Find optimal lift speeds for resin
- **Exposure Time Calculator**: Determine optimal settings based on resin

---

## 🎛️ Workflow and Interface Enhancements

### 14. Advanced 3D Viewer
*Inspired by: Blender, Meshmixer, Lychee Slicer*

- **Multiple Viewport Modes**: Wireframe, shaded, x-ray, transparency
- **Measurement Tools**: Distance, angle, volume measurements
- **Cross-Section View**: Slice through model to see internal structure
- **Animation Preview**: Rotate and animate models for presentation
- **Comparison Mode**: Side-by-side view of original vs. modified
- **Grid Snapping**: Align objects to grid for precision
- **Camera Bookmarks**: Save and recall specific viewpoints
- **Annotation Tools**: Add notes and markers to 3D space

### 15. Batch Processing
*Inspired by: Chitubox, Voxeldance Tango*

- **Batch Import**: Load multiple models simultaneously
- **Batch Conversion**: Convert multiple files at once
- **Batch Scaling**: Apply same scale to multiple models
- **Batch Support Generation**: Generate supports for all models
- **Batch Slicing**: Slice multiple print jobs in sequence
- **Batch Export**: Export multiple files in various formats
- **Print Queue Management**: Schedule and organize multiple print jobs
- **Automated Workflow Scripts**: Create custom processing pipelines

### 16. User Interface Improvements
*Inspired by: Modern CAD software best practices*

- **Customizable UI Layout**: Rearrange panels and tools
- **Keyboard Shortcut Customization**: Define personal hotkeys
- **Theme Variations**: Multiple dark/light themes
- **Context-Sensitive Help**: Hover tooltips and documentation
- **Quick Access Toolbar**: Customizable favorite tools
- **Command Search**: Type to find any function
- **Undo/Redo History Panel**: Visual history of all operations
- **Recent Files and Projects**: Quick access to previous work
- **Project Templates**: Pre-configured setups for common workflows

---

## 🤖 AI and Machine Learning Features

### 17. AI-Powered Optimization
*Inspired by: Fusion 360 Generative Design, Lychee AI*

- **Auto-Orientation**: AI determines optimal print orientation
- **Intelligent Part Categorization**: Enhanced ML-based classification
- **Support Placement AI**: Machine learning for optimal support locations
- **Failure Prediction**: AI analysis of potential print problems
- **Design Optimization**: Suggest design improvements for printability
- **Generative Design**: AI creates optimized structures for strength
- **Style Transfer**: Apply design patterns from reference models

### 18. Computer Vision Features
*Inspired by: Advanced photogrammetry tools*

- **Enhanced Photo-to-3D**: Better reconstruction algorithms
- **COLMAP Integration**: Professional photogrammetry pipeline
- **Multi-View Stereo**: Advanced depth reconstruction
- **Feature Detection**: SIFT, SURF, ORB enhancements
- **Texture Mapping**: Automatic UV unwrapping and texture application
- **Background Removal**: AI-powered subject isolation
- **Lighting Normalization**: Correct varying lighting conditions
- **Scan Cleanup**: Remove noise from 3D scans

---

## 📐 Professional CAD/CAM Features

### 19. Parametric Design
*Inspired by: Fusion 360, SolidWorks*

- **Parametric Modeling**: Design with adjustable parameters
- **Constraint System**: Define relationships between parts
- **Design History**: Timeline of all modeling operations
- **Feature Patterns**: Linear, circular, and custom arrays
- **Assembly Constraints**: Mate parts with mechanical relationships
- **Kinematic Simulation**: Test moving assemblies
- **Drawing Generation**: Create 2D technical drawings from 3D models

### 20. CAM Integration
*Inspired by: Fusion 360, SolidWorks CAM*

- **CNC Toolpath Generation**: Create G-code for milling molds
- **Multi-Axis Machining**: Support for 3, 4, and 5-axis CNC
- **Toolpath Simulation**: Visualize machining operations
- **Post-Processor Library**: Output for various CNC machines
- **Nesting for CNC**: Optimize material usage
- **Tool Management**: Database of cutting tools and parameters

---

## 🌐 Collaboration and Cloud Features

### 21. Cloud Integration
*Inspired by: Lychee Pro, modern cloud platforms*

- **Cloud Storage**: Save projects to cloud
- **Project Sync**: Access projects from multiple devices
- **Version Control**: Track changes and revert to previous versions
- **Collaboration Tools**: Share projects with team members
- **Comment System**: Add feedback on shared models
- **Cloud Rendering**: Offload processing to cloud servers
- **Remote Slicing**: Slice on powerful cloud machines

### 22. Community Features
*Inspired by: Thingiverse, Printables*

- **Model Marketplace**: Share and download community models
- **Printer Profiles Repository**: User-contributed printer settings
- **Support Profiles Library**: Community-shared support configurations
- **Tutorial System**: Built-in learning resources
- **Plugin Marketplace**: Third-party extensions and tools
- **User Forums Integration**: Community help and discussion
- **Print Gallery**: Share completed prints and techniques

---

## 🔧 Advanced Technical Features

### 23. File Format Support
*Inspired by: Universal compatibility*

- **STEP/IGES Import**: Native CAD format support
- **3MF Support**: Enhanced 3D manufacturing format
- **AMF Support**: Additive manufacturing file format
- **Colored STL**: Multi-material/color STL files
- **VRML/X3D**: Web-compatible 3D formats
- **Point Cloud Import**: Support for scan data (PCD, XYZ, E57)
- **Native Format**: Proprietary format preserving all project data
- **Compressed Formats**: Reduce file sizes for large models

### 24. Advanced Export Options
*Inspired by: Professional workflows*

- **Custom Export Templates**: Pre-configured export settings
- **Batch Export Formats**: Export to multiple formats simultaneously
- **Export Profiles**: Save export settings for reuse
- **Model Optimization**: Simplify for web/mobile viewing
- **Texture Baking**: Bake lighting and details into textures
- **LOD Generation**: Create multiple detail levels
- **Print Farm Format**: Export for multiple printers

### 25. Scripting and Automation
*Inspired by: Blender Python API*

- **Python API**: Programmatic control of all features
- **JavaScript Support**: Alternative scripting language
- **Macro Recording**: Record actions for replay
- **Plugin System**: Develop custom extensions
- **Batch Scripts**: Automate repetitive tasks
- **Custom Tools**: Create specialized functions
- **API Documentation**: Comprehensive developer guide

---

## 🎮 Gaming and Entertainment Features

### 26. Miniature-Specific Tools
*Inspired by: Voxeldance Tango miniature features*

- **Miniature Presets**: Optimized settings for tabletop gaming
- **Base Generator**: Create custom bases for miniatures
- **Cluster Scaling**: Scale multiple miniatures uniformly
- **Army Painter Integration**: Batch process game armies
- **Presupported Models**: Library of pre-configured miniatures
- **Pose Editor**: Adjust miniature poses
- **Part Swapping**: Modular miniature customization

### 27. Artistic Features
*Inspired by: ZBrush, 3D-Coat*

- **PBR Painting**: Physically-based texture painting
- **UV Unwrapping**: Automatic and manual UV mapping
- **Texture Baking**: Normal, AO, curvature maps
- **Material Library**: Pre-made material presets
- **Decal System**: Apply graphics to model surfaces
- **Color Schemes**: Save and apply color palettes
- **Weathering Effects**: Age and damage simulation

---

## 📊 Analytics and Reporting

### 28. Print Analytics
*Inspired by: Print farm management software*

- **Success/Failure Tracking**: Log print outcomes
- **Cost Analysis**: Track material and time costs
- **Efficiency Reports**: Printer utilization statistics
- **Failure Analysis**: Identify common failure causes
- **Material Consumption**: Track resin usage over time
- **Print Duration Statistics**: Average times per model type
- **Quality Metrics**: Track surface finish and accuracy

### 29. Project Management
*Inspired by: Professional project tools*

- **Project Timeline**: Visualize project progress
- **Task Checklists**: Track completion of project steps
- **Deadline Tracking**: Set and monitor due dates
- **Resource Planning**: Allocate materials and time
- **Budget Management**: Track project costs
- **Client Collaboration**: Share progress with stakeholders
- **Export Reports**: Generate PDF summaries

---

## 🔐 Advanced Settings and Control

### 30. Advanced Printer Control
*Inspired by: Professional printer firmware*

- **Network Printing**: Send jobs to network-connected printers
- **Wireless Transfer**: Wi-Fi or Bluetooth file transfer
- **Print Monitoring**: Real-time print progress tracking
- **Remote Camera**: View print in progress
- **Pause/Resume Control**: Manage prints remotely
- **Multi-Printer Management**: Control multiple printers
- **Printer Maintenance Reminders**: Schedule cleaning and upkeep

### 31. Advanced Sprue Features
*Inspired by: Injection molding CAD systems*

- **Runner Diameter Optimization**: Calculate optimal flow channels
- **Gate Size Calculator**: Determine ideal gate dimensions
- **Multi-Cavity Sprues**: Support multiple parts per sprue
- **Hot Runner Simulation**: Simulate heated runner systems
- **Runner Balance**: Ensure equal flow to all parts
- **Sprue Cooling Analysis**: Optimize cooling channels
- **Gate Freeze Time**: Calculate optimal cycle times
- **Runner Layout Templates**: Industry-standard configurations

### 32. Quality Control Features
*Inspired by: Manufacturing quality systems*

- **Dimensional Accuracy Check**: Verify scaled dimensions
- **Tolerance Analysis**: Check if features meet specifications
- **Comparison to Original**: Measure differences from source
- **Printability Score**: Rate model manufacturability
- **Defect Prediction**: Identify potential quality issues
- **Inspection Checklist**: Custom quality checkpoints
- **Certification Reports**: Generate compliance documentation

---

## 🚀 Performance Enhancements

### 33. Optimization Features
*Inspired by: High-performance computing*

- **GPU Acceleration**: Utilize graphics card for processing
- **Multi-Threading**: Parallel processing for speed
- **Memory Management**: Efficient handling of large models
- **Progressive Loading**: Load large files incrementally
- **Caching System**: Store intermediate results
- **LOD Rendering**: Dynamic detail based on zoom
- **Viewport Performance Mode**: Fast preview rendering

### 34. Large Model Support
*Inspired by: Industrial CAD systems*

- **Out-of-Core Processing**: Handle models larger than RAM
- **Mesh Streaming**: Load model parts on demand
- **Instancing**: Efficient handling of repeated geometry
- **Proxy Models**: Use simplified versions during editing
- **Assembly Mode**: Work with large multi-part projects
- **Background Processing**: Continue working during operations
- **Incremental Save**: Save large projects without freezing

---

## 📱 Cross-Platform and Mobile

### 35. Mobile Applications
*Inspired by: Mobile CAD apps*

- **iOS App**: iPhone/iPad version for portability
- **Android App**: Mobile model viewing and preparation
- **Tablet Optimization**: Touch-friendly interface
- **AR Preview**: View models in augmented reality
- **Mobile Viewer**: Quick model inspection on the go
- **Cloud Sync**: Access projects across devices
- **Photo Capture**: Take reference photos for modeling

### 36. Web Application
*Inspired by: Cloud-based CAD*

- **Browser-Based Editor**: No installation required
- **WebGL Rendering**: Hardware-accelerated 3D in browser
- **Real-Time Collaboration**: Multiple users editing simultaneously
- **Responsive Design**: Works on any screen size
- **Offline Mode**: Work without internet connection
- **Progressive Web App**: Install as desktop application
- **Cross-Browser Support**: Works in all modern browsers

---

## 🎓 Education and Training

### 37. Learning Resources
*Inspired by: Educational platforms*

- **Interactive Tutorials**: Step-by-step guided lessons
- **Video Library**: Comprehensive video courses
- **Certification Program**: Validate skill levels
- **Sample Projects**: Pre-made learning projects
- **Best Practices Guide**: Industry standards and tips
- **Troubleshooting Wizard**: Guided problem solving
- **Knowledge Base**: Searchable documentation
- **Community Workshops**: Live training sessions

### 38. Accessibility Features
*Inspired by: Universal design principles*

- **Screen Reader Support**: Accessibility for vision impaired
- **Keyboard Navigation**: Full functionality without mouse
- **High Contrast Themes**: Enhanced visibility options
- **Font Size Adjustment**: Customizable text size
- **Color Blind Modes**: Alternative color schemes
- **Voice Commands**: Hands-free operation
- **Tooltips and Help**: Context-sensitive assistance

---

## 🔬 Research and Development

### 39. Experimental Features
*Areas for innovation*

- **AI Part Recognition**: Automatically identify part types
- **Neural Style Transfer**: Apply artistic styles to models
- **Quantum Computing Integration**: Future optimization algorithms
- **Blockchain Verification**: Secure model authentication
- **VR Modeling**: Design in virtual reality
- **Haptic Feedback**: Force feedback for sculpting
- **Procedural Generation**: Algorithm-based model creation

### 40. Integration Possibilities
*Third-party connections*

- **Slicer Integration**: Direct export to popular slicers
- **CAD Software Plugins**: Work within existing tools
- **E-commerce Integration**: Sell models directly
- **Print Service APIs**: Connect to printing services
- **Social Media Sharing**: Post models and prints
- **Project Management Tools**: Trello, Asana integration
- **Version Control Systems**: Git integration for models

---

## 📋 Implementation Priority Matrix

### High Priority (Next 6-12 months)
- Island Detection and Analysis
- Advanced Hollowing Tools
- One-Click Mesh Repair
- Tree/Organic Supports
- Variable Layer Height
- Batch Processing Features
- Cloud Storage and Sync

### Medium Priority (12-24 months)
- Flow Simulation
- AI-Powered Optimization
- Advanced Sculpting Tools
- Print Analytics
- Mobile Applications
- Parametric Design Features
- Plugin System

### Low Priority (24+ months)
- VR Modeling
- Quantum Computing Integration
- Blockchain Features
- Advanced CAM Integration
- Multi-Material Printing
- Experimental AI Features

---

## 🎯 Competitive Analysis Summary

### Features Comparison with Leading Tools

| Feature Category | SprueCrafter | Chitubox Pro | Lychee Pro | PrusaSlicer | Meshmixer | Voxeldance |
|------------------|--------------|--------------|------------|-------------|-----------|------------|
| Sprue Generation | ✅ Unique | ❌ | ❌ | ❌ | ❌ | ❌ |
| Part Categorization | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Support Generation | ✅ Basic | ✅ Advanced | ✅ Advanced | ✅ Advanced | ✅ | ✅ Advanced |
| Hollowing | ❌ Needed | ✅ | ✅ | ⚠️ Basic | ✅ Advanced | ✅ |
| Island Detection | ❌ Needed | ✅ | ✅ | ❌ | ❌ | ✅ |
| Mesh Repair | ⚠️ Basic | ⚠️ Basic | ✅ Advanced | ⚠️ Basic | ✅ Advanced | ✅ |
| Sculpting | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| AI Features | ✅ | ❌ | ⚠️ Some | ❌ | ❌ | ⚠️ Some |
| Photogrammetry | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

✅ = Feature available  
⚠️ = Limited implementation  
❌ = Not available

---

## 💡 Innovation Opportunities

### Unique SprueCrafter Advantages
1. **Sprue Generation Focus**: Only tool dedicated to model kit sprue creation
2. **Part Categorization**: Intelligent classification for model building
3. **Photogrammetry**: Built-in photo-to-3D conversion
4. **Hybrid Architecture**: Combines Python power with Electron UI
5. **Scale Model Specialization**: Tailored for 1/35 scale hobby market

### Areas for Differentiation
1. **Model Kit Database**: Integrate with existing kit catalogs
2. **Assembly Animation**: Generate build instruction videos
3. **Part Marketplace**: Community sharing of sprue-ready parts
4. **Digital Kit Library**: Subscription service for model kits
5. **Print Farm Support**: Manage commercial model kit production
6. **Injection Molding Bridge**: Export for professional manufacturing

---

## 📝 Contribution Guidelines

This document is a living roadmap. Community suggestions for additional features are welcome through:

1. **GitHub Issues**: Label as "feature-request"
2. **Discussions**: Use "Ideas" category
3. **Pull Requests**: Update this document with proposals
4. **Community Vote**: Popular features get priority

---

## 📚 References

This feature list was compiled from analysis of:
- Chitubox / Chitubox Pro
- Lychee Slicer / Lychee Pro
- PrusaSlicer
- Meshmixer
- Voxeldance Tango
- UVTools
- ZBrush
- Blender (+ Model Kit Maker addon)
- 3D-Coat
- Fusion 360
- SolidWorks (+ Plastics addon)
- Moldex3D Designer
- Industry injection molding design principles

---

**Last Updated**: 2025-12-30  
**Version**: 1.0  
**Status**: Living Document

---

*SprueCrafter - Professional sprue generation for the modern scale modeler*
