# SprueCrafter Tests

This directory contains tests for SprueCrafter's advanced features.

## Test Files

### Unit Tests

**`test_advanced_features.py`**
- Comprehensive unit tests for all new advanced features
- Tests for Island Detection, Mesh Repair, Hollowing, and Batch Processing
- 17 test cases covering core functionality
- Run with: `python tests/test_advanced_features.py`

### Integration Tests

**`test_api_integration.py`**
- Integration tests for API endpoints
- Tests all new advanced feature endpoints
- Requires Flask backend to be running
- Run with:
  1. Start backend: `python src/backend/app.py`
  2. In another terminal: `python tests/test_api_integration.py`

## Running Tests

### Run All Unit Tests
```bash
python tests/test_advanced_features.py
```

### Run Integration Tests
```bash
# Terminal 1: Start the backend
python src/backend/app.py

# Terminal 2: Run integration tests
python tests/test_api_integration.py
```

### Run with pytest (optional)
```bash
pip install pytest
pytest tests/
```

## Test Coverage

The tests cover:

1. **Island Detection**
   - Island detection algorithm
   - Risk level calculation
   - Layer analysis
   - Recommendations generation

2. **Mesh Repair**
   - Quality analysis
   - One-click repair
   - Watertight verification
   - Quality score calculation

3. **Hollowing**
   - Material savings estimation
   - Hollowing with drainage holes
   - Weight and cost calculations
   - Volume calculations

4. **Batch Processing**
   - Loading multiple models
   - Batch scaling
   - Batch repair
   - Batch analysis

5. **API Endpoints**
   - `/api/island-detection`
   - `/api/mesh-repair`
   - `/api/mesh-analyze`
   - `/api/hollow`
   - `/api/batch/analyze`
   - `/api/batch/repair`

## Expected Results

All tests should pass with no errors. The unit tests run quickly (< 1 second), while integration tests may take longer depending on model complexity.

### Sample Output
```
test_calculate_risk_level ... ok
test_detect_islands_initialization ... ok
test_detect_islands_no_islands ... ok
...
----------------------------------------------------------------------
Ran 17 tests in 0.063s

OK
```

## Troubleshooting

If tests fail:

1. **Import Errors**: Make sure all dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

2. **Module Not Found**: Ensure you're running from the project root:
   ```bash
   cd /path/to/SprueCrafter
   python tests/test_advanced_features.py
   ```

3. **Integration Test Connection Errors**: Verify the Flask backend is running on port 5000:
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Trimesh Issues**: Some operations may show warnings about boolean operations. This is normal and doesn't affect functionality.

## Adding New Tests

To add new tests:

1. Add test methods to existing test classes in `test_advanced_features.py`
2. Follow the naming convention: `test_<feature_name>`
3. Use descriptive docstrings
4. Include both positive and negative test cases

Example:
```python
def test_new_feature(self):
    """Test description"""
    # Arrange
    setup_data = ...
    
    # Act
    result = feature.do_something(setup_data)
    
    # Assert
    self.assertTrue(result["success"])
    self.assertEqual(result["value"], expected_value)
```
